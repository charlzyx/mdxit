#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer, IncomingMessage } from "node:http";
import { createRequire } from "node:module";
import { createInterface } from "node:readline";
import { Duplex } from "node:stream";
import { existsSync, statSync } from "node:fs";
import { appendFile, cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function printHelp() {
  console.log(`mdxit

Usage:
  mdxit preview [file-or-dir]  Preview an MDX review document or document set
  mdxit init [file.md]         Copy the showcase-based starter document

Examples:
  mdxit preview references/showcase.md
  mdxit init docs/proposal.review.md
`);
}

async function init(target = "review.md") {
  const targetPath = resolve(process.cwd(), target);
  if (existsSync(targetPath)) {
    throw new Error(`${target} already exists`);
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await cp(resolve(rootDir, "references/showcase.md"), targetPath);
  console.log(`Created ${target}`);
}

type PreviewSession = {
  id: string;
  port: number;
  url: string;
  eventsFile: string;
  close: () => void;
};

async function createPreviewSession(projectDir: string, targetPath: string): Promise<PreviewSession> {
  const sessionDir = resolve(projectDir, ".mdxit/session");
  const eventsFile = resolve(sessionDir, "events.jsonl");
  await mkdir(sessionDir, { recursive: true });

  const id = randomBytes(8).toString("hex");
  const server = createServer();
  const sockets = new Set<Duplex>();

  server.on("upgrade", (request, socket) => {
    if (!request.headers.upgrade || request.headers.upgrade.toLowerCase() !== "websocket") {
      socket.destroy();
      return;
    }

    socket.write(createWebSocketHandshake(request));
    sockets.add(socket);
    const parser = createWebSocketFrameParser();
    socket.on("data", (chunk) => {
      const result = parser.push(chunk);
      for (const payload of result.messages) {
        void recordEvent(eventsFile, id, targetPath, payload);
      }
      if (result.close) {
        socket.end();
      }
    });
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => sockets.delete(socket));
  });

  await new Promise<void>((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start MDXit preview session server");
  }

  return {
    id,
    port: address.port,
    url: `ws://127.0.0.1:${address.port}`,
    eventsFile,
    close: () => {
      sockets.forEach((socket) => socket.destroy());
      server.close();
    }
  };
}

function createWebSocketHandshake(request: IncomingMessage) {
  const key = request.headers["sec-websocket-key"];
  if (!key || Array.isArray(key)) {
    throw new Error("Missing websocket key");
  }

  const accept = createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  return [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    ""
  ].join("\r\n");
}

type WebSocketParseResult = {
  messages: string[];
  close: boolean;
};

type WebSocketFrame = {
  final: boolean;
  opcode: number;
  payload: Buffer;
};

function createWebSocketFrameParser() {
  let buffer: Buffer = Buffer.alloc(0);
  let fragmentedText: Buffer[] = [];

  return {
    push(chunk: Buffer): WebSocketParseResult {
      buffer = buffer.length === 0 ? chunk : Buffer.concat([buffer, chunk]);
      const result = decodeWebSocketFrames(buffer);
      buffer = buffer.subarray(result.bytesConsumed);

      const messages: string[] = [];
      for (const frame of result.frames) {
        if (frame.opcode === 0x1) {
          if (frame.final) {
            messages.push(frame.payload.toString("utf8"));
          } else {
            fragmentedText = [frame.payload];
          }
        } else if (frame.opcode === 0x0 && fragmentedText.length) {
          fragmentedText.push(frame.payload);
          if (frame.final) {
            messages.push(Buffer.concat(fragmentedText).toString("utf8"));
            fragmentedText = [];
          }
        }
      }

      return {
        messages,
        close: result.close
      };
    }
  };
}

function decodeWebSocketFrames(buffer: Buffer): { frames: WebSocketFrame[]; close: boolean; bytesConsumed: number } {
  const frames: WebSocketFrame[] = [];
  let offset = 0;
  let close = false;

  while (offset + 2 <= buffer.length) {
    const firstByte = buffer[offset];
    const secondByte = buffer[offset + 1];
    const final = (firstByte & 0x80) === 0x80;
    const opcode = firstByte & 0x0f;
    const masked = (secondByte & 0x80) === 0x80;
    let length = secondByte & 0x7f;
    let headerLength = 2;

    if (length === 126) {
      if (offset + 4 > buffer.length) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (offset + 10 > buffer.length) break;
      const bigLength = buffer.readBigUInt64BE(offset + 2);
      if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) break;
      length = Number(bigLength);
      headerLength = 10;
    }

    const maskLength = masked ? 4 : 0;
    const payloadStart = offset + headerLength + maskLength;
    const payloadEnd = payloadStart + length;
    if (payloadEnd > buffer.length) break;

    if (opcode === 0x8) {
      close = true;
      offset = payloadEnd;
      break;
    }

    if (opcode === 0x1 || opcode === 0x0) {
      const payload = Buffer.from(buffer.subarray(payloadStart, payloadEnd));
      if (masked) {
        const mask = buffer.subarray(offset + headerLength, offset + headerLength + 4);
        for (let i = 0; i < payload.length; i += 1) {
          payload[i] ^= mask[i % 4];
        }
      }
      frames.push({ final, opcode, payload });
    }

    offset = payloadEnd;
  }

  return { frames, close, bytesConsumed: offset };
}

async function recordEvent(eventsFile: string, sessionId: string, targetPath: string, payload: string) {
  let data: unknown;
  try {
    data = JSON.parse(payload);
  } catch {
    data = { type: "raw", payload };
  }

  const event = {
    sessionId,
    targetPath,
    receivedAt: new Date().toISOString(),
    data
  };

  await appendFile(eventsFile, `${JSON.stringify(event)}\n`, "utf8");
  const eventType = typeof data === "object" && data && "type" in data ? String(data.type) : "raw";
  console.log(`MDXit event: ${eventType} -> ${eventsFile}`);
}

async function preview(target = "examples", args: string[] = []) {
  const projectDir = process.cwd();
  const targetPath = resolve(projectDir, target);
  if (!existsSync(targetPath)) {
    throw new Error(`${target} does not exist`);
  }

  const session = await createPreviewSession(projectDir, targetPath);
  console.log(`MDXit session: ${session.id}`);
  console.log(`WS: ${session.url}`);
  console.log(`Events: ${session.eventsFile}`);

  const child = spawn(
    "npx",
    ["vite", "--host", "127.0.0.1", ...args],
    {
      cwd: rootDir,
      env: {
        ...process.env,
        MDXIT_FILE: targetPath,
        MDXIT_SESSION_ID: session.id,
        MDXIT_WS_URL: session.url,
        MDXIT_TARGET_KIND: statSync(targetPath).isDirectory() ? "directory" : "file"
      },
      stdio: "inherit"
    }
  );

  child.on("exit", (code) => {
    session.close();
    process.exit(code ?? 0);
  });

  createInterface({ input: process.stdin, output: process.stdout }).on("SIGINT", () => {
    session.close();
    child.kill("SIGINT");
  });
}

async function main() {
  const [command, file, ...args] = process.argv.slice(2);

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "init") {
    await init(file);
    return;
  }

  if (command === "preview") {
    await preview(file, args);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;
}

declare module "*.md" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;
}

declare module "virtual:mdxit-document" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;
}

declare module "virtual:mdxit-documents" {
  import type { ComponentType } from "react";

  type DocumentModule = {
    default: ComponentType;
    frontmatter?: Record<string, unknown>;
  };

  export const modules: Record<string, DocumentModule>;
}

declare const __MDXIT_TARGET_IS_DIR__: boolean;
declare const __MDXIT_TARGET_DIR__: string;
declare const __MDXIT_SESSION_ID__: string;
declare const __MDXIT_WS_URL__: string;

interface Window {
  __MDXIT_ACTIVE_DOCUMENT__?: string;
}

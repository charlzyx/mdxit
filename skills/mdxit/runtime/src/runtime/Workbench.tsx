import {
  ActionIcon,
  AppShell,
  Anchor,
  Badge,
  Box,
  Card,
  Group,
  Menu,
  SimpleGrid,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  Tree,
  type TreeNodeData,
  useTree,
  useMantineColorScheme
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  Moon,
  Palette,
  Sun,
  Check,
  TableOfContents
} from "lucide-react";
import { ComponentType, useEffect, useMemo, useState } from "react";
import { documents, type MdxitDocument } from "./document-registry";
import { SelectionToolbar } from "./SelectionToolbar";
import { applyTheme, themes } from "./theme-registry";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

const themeStorageKey = "mdxit.theme";
const docsBasePath = "/docs";

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "summer";
  }

  const stored = window.localStorage.getItem(themeStorageKey);
  return themes.some((item) => item.name === stored) ? stored ?? "summer" : "summer";
}

function encodeRouteSegment(segment: string) {
  return encodeURIComponent(segment).replace(/%2F/gi, "/");
}

function pathForDocumentPath(path: string) {
  return `${docsBasePath}/${path.split("/").map(encodeRouteSegment).join("/")}`;
}

function documentPathFromLocation() {
  if (!window.location.pathname.startsWith(`${docsBasePath}/`)) {
    return null;
  }

  return decodeURIComponent(window.location.pathname.slice(docsBasePath.length + 1));
}

function activeIdFromLocation() {
  if (!__MDXIT_TARGET_IS_DIR__) {
    return documents[0]?.id ?? "fallback";
  }

  const currentPath = window.location.pathname;
  if (currentPath === docsBasePath || currentPath === `${docsBasePath}/`) {
    return "__dashboard__";
  }

  const path = documentPathFromLocation();
  if (!path) {
    return "__dashboard__";
  }

  return documents.find((document) => document.path === path)?.id ?? "__dashboard__";
}

export function Workbench({ fallbackDocument }: { fallbackDocument: ComponentType }) {
  const [navOpened, nav] = useDisclosure(false);
  const [asideOpened, aside] = useDisclosure(false);
  const [activeId, setActiveId] = useState(activeIdFromLocation);
  const [theme, setTheme] = useState(getStoredTheme);
  const [toc, setToc] = useState<TocItem[]>([]);
  const { setColorScheme } = useMantineColorScheme();

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeId) ?? documents[0],
    [activeId]
  );
  const ActiveDocument = activeDocument?.Component ?? fallbackDocument;
  const isDashboard = activeId === "__dashboard__" && __MDXIT_TARGET_IS_DIR__;

  const treeData = useMemo(() => buildDocumentTree(documents), []);
  const tree = useTree({
    initialExpandedState: { root: true },
    selectedState: [activeId],
    onSelectedStateChange: ([value]) => {
      if (value && !value.startsWith("group:")) {
        setActiveId(value);
      }
    }
  });

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
    setColorScheme(theme === "ink" ? "dark" : "light");
  }, [setColorScheme, theme]);

  useEffect(() => {
    if (!__MDXIT_TARGET_IS_DIR__) {
      return;
    }

    const syncActiveFromLocation = () => {
      setActiveId(activeIdFromLocation());
    };

    syncActiveFromLocation();
    window.addEventListener("popstate", syncActiveFromLocation);
    return () => window.removeEventListener("popstate", syncActiveFromLocation);
  }, []);

  useEffect(() => {
    window.__MDXIT_ACTIVE_DOCUMENT__ = isDashboard ? undefined : activeDocument?.path;
  }, [activeDocument?.path, isDashboard]);

  useEffect(() => {
    if (!__MDXIT_TARGET_IS_DIR__ || !activeDocument) {
      return;
    }

    const nextPath = isDashboard ? docsBasePath : pathForDocumentPath(activeDocument.path);
    const nextUrl = `${nextPath}${window.location.hash}`;
    if (window.location.pathname !== nextPath || window.location.search) {
      window.history.pushState({ activeId, path: nextPath }, "", nextUrl);
    }
  }, [activeDocument, activeId, isDashboard]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (isDashboard) {
        setToc([]);
        return;
      }

      const headings = Array.from(document.querySelectorAll<HTMLElement>(".document-stage [data-toc-id]"));
      setToc(
        headings.map((heading) => ({
          id: heading.dataset.tocId ?? heading.id,
          text: heading.textContent?.trim() ?? "Untitled",
          level: Number(heading.dataset.tocLevel ?? 2)
        }))
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, isDashboard]);

  return (
    <Box>
      <Tooltip label={navOpened ? "收起侧栏" : "展开侧栏"}>
        <Box
          aria-label="Toggle sidebar"
          className="side-toggle side-toggle-left"
          data-open={navOpened || undefined}
          onClick={nav.toggle}
        >
          {navOpened ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Box>
      </Tooltip>
      <Tooltip label={asideOpened ? "收起目录" : "展开目录"}>
        <Box
          aria-label="Toggle TOC"
          className="side-toggle side-toggle-right"
          data-open={asideOpened || undefined}
          onClick={aside.toggle}
        >
          {asideOpened ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Box>
      </Tooltip>
      <AppShell
        aside={{
          width: 280,
          breakpoint: "md",
          collapsed: { desktop: !asideOpened, mobile: !asideOpened }
        }}
        header={{ height: 56 }}
        navbar={{
          width: 290,
          breakpoint: "md",
          collapsed: { desktop: !navOpened, mobile: !navOpened }
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group className="topbar" h="100%" justify="space-between" px="md">
            <Group className="topbar-left" gap="sm" wrap="nowrap">
              {__MDXIT_TARGET_IS_DIR__ ? (
                <Tooltip label="Dashboard">
                  <ActionIcon
                    aria-label="Open dashboard"
                    onClick={() => setActiveId("__dashboard__")}
                    variant="subtle"
                  >
                    <Home size={18} />
                  </ActionIcon>
                </Tooltip>
              ) : null}
              <div className="topbar-title">
                <Text className="topbar-kicker" c="dimmed" size="xs">
                  MDXit · {isDashboard ? "Document Set" : activeDocument?.group ?? "Review"}
                </Text>
                <Text className="topbar-heading" fw={850} lh={1.1}>
                  {isDashboard ? "Dashboard" : activeDocument?.title ?? "Review Document"}
                </Text>
              </div>
            </Group>

            <Group className="topbar-actions" gap="xs" wrap="nowrap">
              <Menu position="bottom-end" shadow="md" width={160}>
                <Menu.Target>
                  <ActionIcon aria-label="Theme" variant="subtle">
                    <Palette size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {themes.map((item) => (
                    <Menu.Item
                      key={item.name}
                      leftSection={theme === item.name ? <Check size={14} /> : <span className="theme-menu-spacer" />}
                      onClick={() => setTheme(item.name)}
                    >
                      {item.label ?? item.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="sm">
          <Stack gap="sm">
            <ScrollArea h="calc(100vh - 130px)" offsetScrollbars>
              <Tree
                className="document-tree"
                data={treeData}
                expandOnClick
                levelOffset="md"
                renderNode={({ node, expanded, hasChildren, elementProps, selected }) => (
                  <Group
                    {...elementProps}
                    className={`document-tree-node ${selected ? "document-tree-node-active" : ""}`}
                    gap={6}
                    wrap="nowrap"
                  >
                    {hasChildren ? (
                      <ChevronDown className="document-tree-chevron" data-expanded={expanded || undefined} size={14} />
                    ) : (
                      <span className="document-tree-spacer" />
                    )}
                    <Text lineClamp={1} size="sm">
                      {node.label}
                    </Text>
                  </Group>
                )}
                selectOnClick
                tree={tree}
                withLines
              />
            </ScrollArea>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main>
          <Box className="document-stage">
            {isDashboard ? (
              <DocumentDashboard documents={documents} onOpen={setActiveId} />
            ) : (
              <ActiveDocument />
            )}
          </Box>
          <SelectionToolbar />
        </AppShell.Main>

        <AppShell.Aside p="sm">
          <ScrollArea h="calc(100vh - 80px)" offsetScrollbars>
            <Stack gap="lg">
              <Box>
                <Group gap="xs" mb="xs">
                  <TableOfContents size={14} />
                  <Title order={3}>目录</Title>
                </Group>
                <Stack gap={2}>
                  {toc.length ? (
                    toc.map((item) => (
                      <Anchor
                        className="toc-link"
                        href={`#${item.id}`}
                        key={item.id}
                        pl={item.level === 3 ? "xl" : item.level === 2 ? "md" : "xs"}
                        size="sm"
                        underline="never"
                      >
                        {item.text}
                      </Anchor>
                    ))
                  ) : (
                    <Text c="dimmed" size="sm">
                      {isDashboard ? "Open a document to view its TOC." : "No headings yet."}
                    </Text>
                  )}
                </Stack>
              </Box>

              <Box>
                <Group gap="xs" mb="xs">
                  {theme === "ink" ? <Moon size={14} /> : <Sun size={14} />}
                  <Title order={3}>当前文档</Title>
                </Group>
                <Text c="dimmed" size="sm">
                  {activeDocument?.description ?? "Previewing current MDX document."}
                </Text>
                {activeDocument ? (
                  <Badge mt="sm" variant="light">
                    {activeDocument.group}
                  </Badge>
                ) : null}
              </Box>
            </Stack>
          </ScrollArea>
        </AppShell.Aside>
      </AppShell>
    </Box>
  );
}

function buildDocumentTree(items: MdxitDocument[]): TreeNodeData[] {
  const root: TreeNodeData = {
    label: "Documents",
    value: "root",
    children: []
  };

  items.forEach((document) => {
    const parts = document.path.split("/").filter(Boolean);
    const fileName = parts.pop() ?? document.title;
    let cursor = root.children ?? [];
    let prefix = "";

    parts.forEach((part) => {
      prefix = prefix ? `${prefix}/${part}` : part;
      const value = `group:${prefix}`;
      let existing = cursor.find((node) => node.value === value);
      if (!existing) {
        existing = { label: part, value, children: [] };
        cursor.push(existing);
      }
      cursor = existing.children ?? [];
    });

    cursor.push({
      label: document.title || fileName,
      value: document.id
    });
  });

  return root.children ?? [];
}

function DocumentDashboard({
  documents: items,
  onOpen
}: {
  documents: MdxitDocument[];
  onOpen: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const grouped = new Map<string, number>();
    items.forEach((item) => grouped.set(item.group, (grouped.get(item.group) ?? 0) + 1));
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <Box className="dashboard-page">
      <Box className="dashboard-hero">
        <Group gap="xs" mb="sm">
          <FolderOpen size={18} />
          <Text fw={800} size="xs">
            MDXit Document Set
          </Text>
        </Group>
        <Title order={1}>选择一个文档开始审查</Title>
        <Text c="dimmed" maw={720} mt="sm">
          这里是目录预览的默认导航页。Layout、Sidebar 和 Toc 属于基础工作台能力，文档作者只需要专注写 MDX 内容和语义组件。
        </Text>
        <Group gap="xs" mt="lg">
          <Badge color="teal" variant="light">
            {items.length} documents
          </Badge>
          {groups.map(([group, count]) => (
            <Badge key={group} variant="outline">
              {group}: {count}
            </Badge>
          ))}
        </Group>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mt="md" spacing="md">
        {items.map((document) => (
          <Card
            className="dashboard-card"
            key={document.id}
            onClick={() => onOpen(document.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(document.id);
              }
            }}
            radius="md"
            role="button"
            tabIndex={0}
            withBorder
          >
            <Group gap="xs" mb="xs">
              <FileText size={16} />
              <Badge size="sm" variant="light">
                {document.group}
              </Badge>
            </Group>
            <Text fw={800} lh={1.25}>
              {document.title}
            </Text>
            <Text c="dimmed" lineClamp={3} mt="xs" size="sm">
              {document.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

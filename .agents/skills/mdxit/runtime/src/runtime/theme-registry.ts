export type ThemeTokenName =
  | "bg"
  | "panel"
  | "panelStrong"
  | "border"
  | "borderStrong"
  | "radius"
  | "text"
  | "muted"
  | "heading"
  | "accent"
  | "accentStrong"
  | "danger"
  | "warn"
  | "codeBg"
  | "codeText"
  | "codeBorder";

export type ThemeDefinition = {
  name: string;
  label?: string;
  codeTheme?: "github-light" | "github-dark";
  tokens: Partial<Record<ThemeTokenName, string>>;
};

const builtInThemes: ThemeDefinition[] = [
  {
    name: "summer",
    label: "Summer",
    codeTheme: "github-light",
    tokens: {
      bg: "#fafafa",
      radius: "2px",
      panel: "#ffffff",
      panelStrong: "#f9fafb",
      border: "#e5e7eb",
      borderStrong: "#d1d5db",
      text: "#334155",
      muted: "#64748b",
      heading: "#0f172a",
      accent: "#059669",
      accentStrong: "#047857",
      danger: "#dc2626",
      warn: "#d97706",
      codeBg: "#f1f5f9",
      codeText: "#334155",
      codeBorder: "#e2e8f0"
    }
  },
  {
    name: "ink",
    label: "Ink",
    codeTheme: "github-dark",
    tokens: {
      bg: "#111614",
      radius: "6px",
      panel: "#18201d",
      panelStrong: "#202b27",
      border: "#34443f",
      borderStrong: "#4a615a",
      text: "#e3e7df",
      muted: "#a7b0aa",
      heading: "#f4f0de",
      accent: "#7cc8a6",
      accentStrong: "#a5d8c0",
      danger: "#f08d78",
      warn: "#e3bd64",
      codeBg: "#070908",
      codeText: "#e9e3c7",
      codeBorder: "#2d3934"
    }
  }
];

const srcThemes = import.meta.glob<ThemeDefinition>("../mdxit/themes/*.json", {
  eager: true,
  import: "default"
});

const projectThemes = import.meta.glob<ThemeDefinition>("../../.mdxit/themes/*.json", {
  eager: true,
  import: "default"
});

export const themes = [
  ...builtInThemes,
  ...Object.values(projectThemes).filter((theme) => theme.name && theme.tokens),
  ...Object.values(srcThemes).filter((theme) => theme.name && theme.tokens)
];

function cssVariableName(token: ThemeTokenName) {
  return `--${token.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
}

export function applyTheme(themeName: string) {
  const theme = themes.find((item) => item.name === themeName) ?? themes[0];
  const radius = theme.tokens.radius ?? "6px";
  const accent = theme.tokens.accent ?? "#228be6";
  const accentStrong = theme.tokens.accentStrong ?? accent;
  const danger = theme.tokens.danger ?? "#fa5252";
  const warn = theme.tokens.warn ?? "#fab005";
  const border = theme.tokens.border ?? "#dee2e6";
  const panelStrong = theme.tokens.panelStrong ?? "#f8f9fa";
  const text = theme.tokens.text ?? "#000000";
  const muted = theme.tokens.muted ?? "#868e96";
  const bg = theme.tokens.bg ?? "#ffffff";

  document.documentElement.dataset.theme = theme.name;
  document.documentElement.dataset.codeTheme = theme.codeTheme ?? (theme.name === "ink" ? "github-dark" : "github-light");

  Object.entries(theme.tokens).forEach(([token, value]) => {
    document.documentElement.style.setProperty(cssVariableName(token as ThemeTokenName), value);
  });

  document.documentElement.style.setProperty("--mantine-radius-default", radius);
  document.documentElement.style.setProperty("--mantine-radius-sm", `calc(${radius} * 0.5)`);
  document.documentElement.style.setProperty("--mantine-radius-md", radius);
  document.documentElement.style.setProperty("--mantine-radius-lg", `calc(${radius} * 2)`);
  document.documentElement.style.setProperty("--mantine-color-body", bg);
  document.documentElement.style.setProperty("--mantine-color-text", text);
  document.documentElement.style.setProperty("--mantine-color-dimmed", muted);
  document.documentElement.style.setProperty("--mantine-primary-color-filled", accent);
  document.documentElement.style.setProperty("--mantine-primary-color-filled-hover", accentStrong);
  document.documentElement.style.setProperty("--mantine-primary-color-light", `color-mix(in srgb, ${accent} 10%, ${panelStrong})`);
  document.documentElement.style.setProperty("--mantine-primary-color-light-hover", `color-mix(in srgb, ${accent} 16%, ${panelStrong})`);
  document.documentElement.style.setProperty("--mantine-primary-color-light-color", accentStrong);
  document.documentElement.style.setProperty("--mantine-color-default-border", border);
  document.documentElement.style.setProperty("--mantine-color-error", danger);
  document.documentElement.style.setProperty("--mantine-color-red-filled", danger);
  document.documentElement.style.setProperty("--mantine-color-yellow-filled", warn);
}

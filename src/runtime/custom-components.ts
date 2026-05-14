import type { ComponentType } from "react";

type ComponentModule = {
  default?: ComponentType<unknown>;
  mdxitName?: string;
};

const srcModules = import.meta.glob<ComponentModule>("../mdxit/components/*.{tsx,jsx}", {
  eager: true
});

const projectModules = import.meta.glob<ComponentModule>("../../.mdxit/components/*.{tsx,jsx}", {
  eager: true
});

function componentNameFromPath(path: string) {
  return path
    .split("/")
    .pop()
    ?.replace(/\.[tj]sx$/, "");
}

function extractComponents(modules: Record<string, ComponentModule>): Record<string, ComponentType<unknown>> {
  return Object.fromEntries(
    Object.entries(modules).flatMap(([path, module]) => {
      if (!module.default) {
        return [];
      }

      const name = module.mdxitName ?? componentNameFromPath(path);
      return name ? [[name, module.default]] : [];
    })
  );
}

export const customComponents = {
  ...extractComponents(srcModules),
  ...extractComponents(projectModules)
};

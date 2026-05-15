import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { MDXProvider } from "@mdx-js/react";
import ReviewDocument from "virtual:mdxit-document";
import { mdxComponents } from "./runtime/mdx-components";
import { Workbench } from "./runtime/Workbench";
import "@mantine/core/styles.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <MDXProvider components={mdxComponents}>
        <Workbench fallbackDocument={ReviewDocument} />
      </MDXProvider>
    </MantineProvider>
  </React.StrictMode>
);

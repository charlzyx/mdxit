import { useRef, useEffect } from "react";

// Dynamic import to avoid bundling F2 into the initial chunk
let F2Module: typeof import("@antv/f2") | null = null;

async function loadF2() {
  if (!F2Module) {
    F2Module = await import("@antv/f2");
  }
  return F2Module;
}

type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

interface ChartConfig {
  type?: ChartType;
  data: Record<string, unknown>[];
  x?: string;
  y?: string;
  color?: string;
  width?: number;
  height?: number;
}

function parseConfig(code: string, chartType: string): ChartConfig {
  const config = JSON.parse(code) as ChartConfig;
  config.type = (config.type || chartType || "bar") as ChartType;
  return config;
}

export function AntVChart({ chartType, code }: { chartType: string; code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<{ destroy?: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cleanupChart = () => {
      if (chartInstanceRef.current?.destroy) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = null;

      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
      canvasRef.current = null;
    };

    async function render() {
      let config: ChartConfig;
      try {
        config = parseConfig(code, chartType);
      } catch {
        return;
      }

      if (!config.data?.length) return;

      const container = containerRef.current;
      if (!container) return;

      const width = config.width ?? container.clientWidth;
      const height = config.height ?? Math.max(280, width * 0.55);

      cleanupChart();

      const canvas = document.createElement("canvas");
      canvas.width = width * (window.devicePixelRatio || 2);
      canvas.height = height * (window.devicePixelRatio || 2);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvasRef.current = canvas;
      container.appendChild(canvas);

      if (cancelled) return;

      try {
        const F2 = await loadF2();
        const ctx = canvas.getContext("2d");
        if (!ctx || cancelled) return;

        const { jsx, Canvas, Chart, Interval, Line, Point, Area, Axis } = F2 as any;
        const data = config.data;
        const xField = config.x || Object.keys(data[0])[0];
        const yField = config.y || Object.keys(data[0])[1] || Object.keys(data[0])[0];
        const colorField = config.color;

        const geomProps: Record<string, unknown> = { x: xField, y: yField };
        if (colorField) geomProps.color = colorField;

        let geomEl: any;
        const t = config.type || "bar";
        if (t === "line") geomEl = jsx(Line, geomProps);
        else if (t === "area") geomEl = jsx(Area, geomProps);
        else if (t === "scatter") geomEl = jsx(Point, geomProps);
        else if (t === "pie") geomEl = jsx(Interval, { x: xField, y: yField, color: colorField || xField });
        else geomEl = jsx(Interval, geomProps);

        const chartProps: Record<string, unknown> = { data };
        if (t === "pie") chartProps.coord = { type: "polar" };

        const chartChildren: any[] = [geomEl];
        if (t !== "pie") {
          chartChildren.push(jsx(Axis, { field: xField }));
          chartChildren.push(jsx(Axis, { field: yField }));
        }

        const chartVNode = jsx(Chart, chartProps, ...chartChildren);
        const canvasVNode = jsx(Canvas, { context: ctx, pixelRatio: window.devicePixelRatio || 2 }, chartVNode);
        const canvasInst = new Canvas(canvasVNode.props);
        chartInstanceRef.current = canvasInst;
        await canvasInst.render();
      } catch (err) {
        console.warn("AntV chart render failed:", err);
      }
    }

    render();

    return () => {
      cancelled = true;
      cleanupChart();
    };
  }, [chartType, code]);

  return <div ref={containerRef} className="antv-chart-container" style={{ margin: "18px 0", width: "100%" }} />;
}

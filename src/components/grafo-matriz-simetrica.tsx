"use client";

import { useState, useEffect, useMemo, useRef, FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import useWindowSize from "@/hooks/useWindowSize";
import { ScrollArea } from "./ui/scroll-area";
import findConnectedComponents from "@/lib/findConnectedComponents";
import { InfoIcon } from "lucide-react";
import ComponentsConvexs from "./ComponentsConvexs";
import Matrix from "./Matrix";
import getLetter from "@/utils/getLetter";

const resolveSize = (size: number | string) => {
  if (size === "") {
    return 0;
  }
  return Number(size);
};

export function GrafoMatrizSimetrica() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [components, setComponents] = useState<
    {
      from: number;
      to: number[];
    }[][]
  >([]);

  const [size, setSize] = useState<number | string>(8);
  const [matrix, setMatrix] = useState<boolean[][]>([]);
  const [error, setError] = useState<string>("");
  // const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { height, width } = useWindowSize(containerRef);

  const sizeNumber = useMemo(() => resolveSize(size), [size]);

  const generateMatrix: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (sizeNumber < 5 || sizeNumber > 16) {
      setError("Por favor, ingrese un número entre 8 y 16.");
      setMatrix([]);
      return;
    }

    setError("");
    const newMatrix: boolean[][] = [];
    for (let i = 0; i < sizeNumber; i++) {
      newMatrix[i] = [];
      for (let j = 0; j < sizeNumber; j++) {
        if (i <= j) {
          newMatrix[i][j] = Math.random() < 0.5;
        } else {
          newMatrix[i][j] = newMatrix[j][i];
        }
      }
    }
    setMatrix(newMatrix);
  };

  const toggleCell = (row: number, col: number) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = !newMatrix[row][col];
    setMatrix(newMatrix);
  };


  // const onNodeClick = useCallback(
  //   (event, node) => {
  //     setSelectedNode(node.id === selectedNode ? null : node.id);
  //   },
  //   [selectedNode]
  // );

  const colors = useMemo(
    () => [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
    ],
    []
  );

  useEffect(() => {
    const newComponents = findConnectedComponents(matrix);

    setComponents(newComponents);
  }, [matrix]);

  const cellSize = Math.min(60, width / 12);
  const nodeRadius = cellSize / 3;
  const fontSize = nodeRadius * 0.8;

  const idGenerated = useMemo(
    () =>
      components
        .map((c) => c.map((n) => `${n.from}-${n.to.join("-")}`).join("-"))
        .join("~"),
    [components]
  );

  const layout = useMemo(
    () =>
      components.map((component) => {
        const nodeCount = component.length;
        const angle = (2 * Math.PI) / nodeCount;
        const radius = cellSize * (nodeCount < 3 ? 1 : 2);

        const nodes = component.map((node, i) => {
          const x = Math.cos(i * angle) * radius;
          const y = Math.sin(i * angle) * radius;
          return { ...node, x, y };
        });

        const minX = Math.min(...nodes.map((n) => n.x));
        const minY = Math.min(...nodes.map((n) => n.y));
        const maxX = Math.max(...nodes.map((n) => n.x));
        const maxY = Math.max(...nodes.map((n) => n.y));
        const width = maxX - minX + cellSize * 2;
        const height = maxY - minY + cellSize * 2;

        return {
          nodes: nodes.map((n) => ({
            ...n,
            x: n.x - minX + cellSize,
            y: n.y - minY + cellSize,
          })),
          width,
          height,
        };
      }),
    [idGenerated]
  );

  // Position components to avoid overlaps
  const positionedLayout = useMemo(
    () =>
      layout.reduce((acc, group, index) => {
        let attempts = 0;
        let groupX: number, groupY: number;
        do {
          groupX = Math.random() * (width - group.width);
          groupY = Math.random() * (height - group.height);
          attempts++;
        } while (
          attempts < 100 &&
          acc.some(
            (l) =>
              groupX < l.x + l.width &&
              groupX + group.width > l.x &&
              groupY < l.y + group.height &&
              groupY + group.height > l.y
          )
        );

        if (attempts >= 100) {
          console.warn(
            "Could not find non-overlapping position for component",
            index
          );
        }

        return [...acc, { ...group, x: groupX, y: groupY }];
      }, [] as ((typeof layout)[0] & { x: number; y: number })[]),
    [idGenerated, Math.round(width), Math.round(height)]
  );

  return (
    <main className="w-full h-dvh sm:flex">
      <section
        ref={containerRef}
        className="border rounded sm:flex-1 sm:w-full h-dvh"
      >
        <AnimatePresence>
          <ComponentsConvexs containerRef={containerRef} components={components} />
        </AnimatePresence>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            {colors.map((color, index) => (
              <marker
                key={index}
                id={`arrowhead-${index}`}
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <motion.path
                  d="M0,0 L0,6 L8,3 z"
                  fill={color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                />
              </marker>
            ))}
          </defs>
          <AnimatePresence>
            {positionedLayout.map((group, componentIndex) => {
              return (
                <motion.g
                  key={componentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: group.x, y: group.y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                >
                  {group.nodes.map((node, i) => {
                    return (
                      <g key={node.from}>
                        {node.to.map((targetValue, j) => {
                          const targetNode = group.nodes.find(
                            (n) => n.from === targetValue
                          );
                          if (!targetNode) return null;
                          const dx = targetNode.x - node.x;
                          const dy = targetNode.y - node.y;
                          const distance = Math.sqrt(dx * dx + dy * dy);
                          const ratio = (distance - nodeRadius - 5) / distance;
                          const endX = node.x + dx * ratio;
                          const endY = node.y + dy * ratio;
                          const isBidirectional = targetNode.to.includes(
                            node.from
                          );
                          const curveOffset = isBidirectional ? 20 : 0;
                          const midX = (node.x + targetNode.x) / 2;
                          const midY = (node.y + targetNode.y) / 2;
                          const controlX = midX - (curveOffset * dy) / distance;
                          const controlY = midY + (curveOffset * dx) / distance;
                          const pathD = `M${node.x},${node.y} Q${controlX},${controlY} ${endX},${endY}`;
                          return (
                            <motion.path
                              key={`${i}-${j}`}
                              d={pathD}
                              fill="none"
                              stroke={colors[componentIndex % colors.length]}
                              strokeWidth="2"
                              markerEnd={`url(#arrowhead-${
                                componentIndex % colors.length
                              })`}
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              exit={{ pathLength: 0 }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                            />
                          );
                        })}
                        <motion.circle
                          r={nodeRadius}
                          fill={colors[componentIndex % colors.length]}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, cx: node.x, cy: node.y }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.15,
                          }}
                        />
                        <motion.text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={fontSize}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, x: node.x, y: node.y }}
                          transition={{
                            duration: 0.3,
                            delay: 0.15,
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          {getLetter(node.from)}
                        </motion.text>
                      </g>
                    );
                  })}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </section>

      <section className="hidden sm:block">
        <div className="w-[400px] sm:w-[540px] h-dvh  p-4 sm:max-w-full flex flex-col">
          <div className="px-2 py-3 flex justify-between">
            <div>
              <h2>GraphAnalyzer</h2>
              <p>Genera y modifica una matriz booleana.</p>
            </div>
            <Button className="">
              <InfoIcon className="w-5 h-5" />
            </Button>
          </div>
          <ScrollArea className="mt-4 flex flex-col flex-1">
            <div className="flex flex-col py-3 sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 items-center justify-center">
              <form onSubmit={generateMatrix} id="form-matrix-large" className="flex items-center space-x-2">
                <label htmlFor="matrix-size" className="text-sm font-medium">
                  Tamaño de la matriz:
                </label>
                <Input
                  id="matrix-size"
                  type="number"
                  value={size}
                  onChange={(e) =>
                    setSize(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={8}
                  max={16}
                  className="w-20"
                />
              </form>
              <Button type="submit" form="form-matrix-large"  className="w-full sm:w-auto">
                Generar Matriz
              </Button>
            </div>
            {matrix.length > 0 && (
              <Matrix matrix={matrix} toggleCell={toggleCell} />
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </ScrollArea>
        </div>
      </section>
      <section className="absolute top-4 right-4 block sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Abrir Matriz</Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-full flex flex-col">
            <SheetHeader>
              <SheetTitle>Matriz Booleana Interactiva</SheetTitle>
              <SheetDescription>
                Genera y modifica una matriz booleana.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-4 flex flex-col flex-1">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 items-center justify-center">
                <form onSubmit={generateMatrix} id="form-matrix-mobile" className="flex items-center space-x-2">
                  <label htmlFor="matrix-size" className="text-sm font-medium">
                    Tamaño de la matriz:
                  </label>
                  <Input
                    id="matrix-size"
                    type="number"
                    value={size}
                    onChange={(e) =>
                      setSize(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    min={8}
                    max={16}
                    className="w-20"
                  />
                </form>
                <Button  form="form-matrix-mobile" className="w-full sm:w-auto">
                  Generar Matriz
                </Button>
              </div>
              {matrix.length > 0 && (
                <div className="overflow-x-auto overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2"></th>
                        {matrix[0].map((_, index) => (
                          <th
                            key={index}
                            className="p-2 font-bold text-foreground"
                          >
                            {getLetter(index)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 pr-0 font-bold text-foreground">
                            {getLetter(i)}
                          </td>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className={`border border-border p-2 text-center cursor-pointer transition-colors duration-200 hover:bg-accent/50`}
                              onClick={() => toggleCell(i, j)}
                              role="button"
                              aria-label={`Cambiar valor en fila ${getLetter(
                                i
                              )}, columna ${getLetter(j)}. Actualmente ${
                                cell ? "verdadero" : "falso"
                              }.`}
                            >
                              {Number(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </section>
    </main>
  );
}

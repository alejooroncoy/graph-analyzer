import { InfoIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import Matrix from "./Matrix";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

type Props = {
  steps: {
    adjacencyMatrix: boolean[][];
    pathMatrix: boolean[][];
    sortedIndices: number[];
    reorderedMatrix: boolean[][];
    originalIndices: number[];
    components: number[][];
  } | null;
};

const StepsAnalyzer = ({ steps }: Props) => {
  const highlightAreas = steps?.components.map((component) => {
    const startRow = component[0];
    const startCol = component[0];
    const endRow = component[component.length - 1];
    const endCol = component[component.length - 1];
    return {
      startRow,
      startCol,
      endRow,
      endCol,
      color: "rgba(31, 119, 180, 0.2)",
    };
  });

  const highlightAreasDiagonal = steps?.adjacencyMatrix.map((row, i) => {
    return {
      startRow: i,
      startCol: i,
      endRow: i,
      endCol: i,
      color: "rgba(31, 119, 180, 0.2)",
    };
  });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="icon" className="">
          <InfoIcon className="w-5 h-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pasos para hallar los componentes convexos</DrawerTitle>
          <DrawerDescription>
            Paso a paso de la matriz a los componentes
          </DrawerDescription>
        </DrawerHeader>
        <div className="w-full min-h-24 items-center justify-center">
          {steps ? (
            <Carousel
            opts={{
              align: "start",
            }}
            className="ml-20 w-[calc(100%_-_10rem)] pb-3">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 2xl:basis-1/3 space-y-3">
                  <Matrix highlightAreas={highlightAreasDiagonal} matrix={steps.adjacencyMatrix} />
                  <h4 className="text-center">Paso 1: Colocar {"1's"} en la diagonal principal</h4>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 2xl:basis-1/3 space-y-3">
                  <Matrix matrix={steps.pathMatrix} />
                  <h4 className="text-center">
                    Paso 2: Calcular la matriz de caminos (Usamos el algoritmo de warshall)
                  </h4>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 2xl:basis-1/3 space-y-3">
                  <Matrix
                    indices={steps.originalIndices}
                    matrix={steps.reorderedMatrix}
                  />
                  <h4 className="text-center">Paso 3: Reordenar las filas y columnas</h4>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 2xl:basis-1/3 space-y-3">
                  <Matrix
                    highlightAreas={highlightAreas}
                    indices={steps.originalIndices}
                    matrix={steps.reorderedMatrix}
                  />
                  <h4 className="text-center">
                    Paso 4: Encontrar los bloques diagonales de {"1's"} que
                    representan los componentes conexos
                  </h4>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <p>No hay matriz generada</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default StepsAnalyzer;

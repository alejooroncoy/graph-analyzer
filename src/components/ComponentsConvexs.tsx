import { Component } from "lucide-react";
import { Button } from "./ui/button";
import { FC, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import getLetter from "@/utils/getLetter";

type ComponentConvex = {
  from: number;
  to: number[];
}[];

type ComponentsConvexsProps = {
  components: ComponentConvex[];
  containerRef: React.RefObject<HTMLDivElement>;
};

const ButtonAnimate = motion(Button);

const ComponentsConvexs: FC<ComponentsConvexsProps> = ({
  components,
  containerRef,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleClickToggleWidth = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.style.width =
        scrollAreaRef.current.style.width === "0px"
          ? `${
              (containerRef.current?.clientWidth || 0) -
              scrollAreaRef.current?.getBoundingClientRect().x -
              20
            }px`
          : "0px";
    }
  };

  return (
    <div className="absolute m-4 flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AnimatePresence>
              {components.length > 0 && (
                <ButtonAnimate
                  exit={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  initial={{
                    opacity: 0,
                  }}
                  size="icon"
                  onClick={handleClickToggleWidth}
                >
                  <Component />
                </ButtonAnimate>
              )}
            </AnimatePresence>
          </TooltipTrigger>
          <TooltipContent>
            <p>Componentes convexos</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ScrollArea
        ref={scrollAreaRef}
        className="whitespace-nowrap transition-all duration-200 w-0"
      >
        <Card>
          <CardContent className="py-3">
            <ul className="flex gap-3">
              {components.map((component, index) => (
                <li className="text-md whitespace-nowrap" key={index}>
                  V<sub>{index}</sub>
                  <span> = </span>
                  <span>{`{ ${component
                    .map((j) => getLetter(j.from))
                    .join(", ")} }`}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ComponentsConvexs;

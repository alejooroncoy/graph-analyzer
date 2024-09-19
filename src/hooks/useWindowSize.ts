"use client";

import { RefObject, useEffect, useState } from "react";

const useWindowSize = (containerRef: RefObject<HTMLElement>) => {
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window === "undefined" ? 0 : containerRef.current?.clientWidth || 0,
    height: typeof window === "undefined" ? 0 : containerRef.current?.clientHeight || 0,
  }));

  useEffect(() => {
    if (containerRef.current) {
      let idx: NodeJS.Timeout;

      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if(idx) clearTimeout(idx);

          idx = setTimeout(() => {
            setWindowSize({
              width: entry.contentRect.width,
              height: entry.contentRect.height
            })
          }, 250);
        }
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [containerRef])

  return windowSize;
}

export default useWindowSize;
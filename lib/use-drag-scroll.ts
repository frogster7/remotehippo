"use client";

import { useCallback, useRef } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDown.current = true;
    hasDragged.current = false;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
    startX.current = e.pageX;
    scrollLeft.current = ref.current.scrollLeft;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    isDown.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
  }, []);

  const onMouseUp = useCallback(() => {
    if (!ref.current) return;
    isDown.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
    setTimeout(() => {
      hasDragged.current = false;
    }, 0);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    hasDragged.current = true;
    e.preventDefault();
    const walk = e.pageX - startX.current;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    ref,
    handlers: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
      onClickCapture,
    },
  };
}

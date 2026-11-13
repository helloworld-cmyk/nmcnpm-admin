import { useEffect, useState } from "react";

export type PopoverPosition = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

type AnchorRef = { current: HTMLElement | null };

export function usePopoverPosition(
  open: boolean,
  anchorRef: AnchorRef,
  minWidth = 0,
  maxPanelHeight = 300
): PopoverPosition | null {
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const margin = 12;
      const gap = 6;
      const availableWidth = Math.max(window.innerWidth - margin * 2, 0);
      const width = Math.min(Math.max(rect.width, minWidth), availableWidth);
      const below = window.innerHeight - rect.bottom - gap - margin;
      const above = rect.top - gap - margin;
      const preferBelow = below >= 240 || below >= above;
      const maxHeight = Math.max(
        120,
        Math.min(maxPanelHeight, preferBelow ? below : above)
      );
      const left = Math.min(
        Math.max(rect.left, margin),
        Math.max(window.innerWidth - width - margin, margin)
      );

      setPosition(
        preferBelow
          ? { left, width, top: rect.bottom + gap, maxHeight }
          : {
              left,
              width,
              bottom: window.innerHeight - rect.top + gap,
              maxHeight,
            }
      );
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, minWidth, maxPanelHeight]);

  return open ? position : null;
}
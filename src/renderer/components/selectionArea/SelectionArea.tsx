import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box } from "@mui/material";

interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface SelectionAreaProps {
  children: React.ReactNode;
  onSelectionChange?: (rect: SelectionRect | null) => void;
  onSelectionComplete?: (rect: SelectionRect) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SelectionArea: React.FC<SelectionAreaProps> = ({
  children,
  onSelectionChange,
  onSelectionComplete,
  disabled = false,
  className,
  style,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Only handle left mouse button (button 0)
      if (event.button !== 0 || disabled) {
        return;
      }

      const target = event.target as Element;
      if (target.closest(".no-selection")) {
        // Clicked on an element that should not trigger selection
        return;
      }
      const nodeElement = target.closest("[data-node-id]");
      if (nodeElement) {
        // Clicked on a node, do not start selection
        return;
      }

      // event.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const startX = event.clientX - rect.left;
      const startY = event.clientY - rect.top;

      const newSelection = {
        startX,
        startY,
        endX: startX,
        endY: startY,
      };

      setSelection(newSelection);
      setIsSelecting(true);
      onSelectionChange?.(newSelection);
    },
    [disabled, onSelectionChange]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isSelecting || !selection || !containerRef.current) {
        return;
      }

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const endX = event.clientX - rect.left;
      const endY = event.clientY - rect.top;

      const updatedSelection = {
        ...selection,
        endX,
        endY,
      };

      setSelection(updatedSelection);
      onSelectionChange?.(updatedSelection);
    },
    [isSelecting, selection, onSelectionChange]
  );

  const handleMouseUp = useCallback(
    (_event: MouseEvent) => {
      if (!isSelecting || !selection) {
        return;
      }

      setIsSelecting(false);
      onSelectionComplete?.(selection);

      setSelection(null);
      onSelectionChange?.(null);
    },
    [isSelecting, selection, onSelectionComplete, onSelectionChange]
  );

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  // Calculate selection box style
  const getSelectionBoxStyle = (): React.CSSProperties => {
    if (!selection) {
      return { display: "none" };
    }

    const { startX, startY, endX, endY } = selection;
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    return {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: "2px dashed #007acc",
      backgroundColor: "rgba(0, 122, 204, 0.1)",
      pointerEvents: "none",
      zIndex: 1000,
      boxSizing: "border-box",
    };
  };

  return (
    <Box
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
      }}
      onMouseDown={handleMouseDown}
      // Prevent context menu on middle click
      onContextMenu={(e) => {
        if (isSelecting) {
          e.preventDefault();
        }
      }}
    >
      {children}

      {/* Selection overlay */}
      <div style={getSelectionBoxStyle()} />
    </Box>
  );
};

export type { SelectionRect };

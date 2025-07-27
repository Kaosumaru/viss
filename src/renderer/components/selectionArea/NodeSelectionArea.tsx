import React, { useCallback, useState } from "react";
import { SelectionArea } from "./SelectionArea";
import type { SelectionRect } from "./SelectionArea";

interface NodeSelectionAreaProps {
  children: React.ReactNode;
  onNodeSelection?: (nodeIds: string[]) => void;
  getNodesInArea?: (rect: SelectionRect) => string[];
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Enhanced SelectionArea component for node editors.
 * Provides middle-click drag selection for nodes within a specified area.
 */
export const NodeSelectionArea: React.FC<NodeSelectionAreaProps> = ({
  children,
  onNodeSelection,
  getNodesInArea,
  disabled = false,
  className,
  style,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectionChange = useCallback(
    (rect: SelectionRect | null) => {
      setIsSelecting(rect !== null);

      // Optionally provide real-time feedback during selection
      if (rect && getNodesInArea) {
        const selectedNodes = getNodesInArea(rect);
        // You could provide visual feedback here for nodes being selected
        console.log("Nodes in selection area:", selectedNodes);
      }
    },
    [getNodesInArea]
  );

  const handleSelectionComplete = useCallback(
    (rect: SelectionRect) => {
      if (getNodesInArea && onNodeSelection) {
        const selectedNodes = getNodesInArea(rect);
        onNodeSelection(selectedNodes);
      }
      setIsSelecting(false);
    },
    [getNodesInArea, onNodeSelection]
  );

  return (
    <SelectionArea
      onSelectionChange={handleSelectionChange}
      onSelectionComplete={handleSelectionComplete}
      disabled={disabled}
      className={className}
      style={{
        cursor: isSelecting ? "crosshair" : "default",
        ...style,
      }}
    >
      {children}
    </SelectionArea>
  );
};

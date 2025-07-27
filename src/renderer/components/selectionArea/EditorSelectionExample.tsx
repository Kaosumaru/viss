import React, { useCallback, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { NodeSelectionArea } from "./NodeSelectionArea";
import { getNodesInSelectionArea } from "./selectionUtils";
import type { SelectionRect } from "./SelectionArea";

interface EditorSelectionExampleProps {
  onNodesSelected?: (nodeIds: string[]) => void;
}

/**
 * Example integration of SelectionArea with a node editor.
 * This shows how to use the selection area with Rete.js or similar node editors.
 */
export const EditorSelectionExample: React.FC<EditorSelectionExampleProps> = ({
  onNodesSelected,
}) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const handleNodeSelection = useCallback(
    (nodeIds: string[]) => {
      console.log("Selected nodes:", nodeIds);
      onNodesSelected?.(nodeIds);
      
      // Example: Add visual feedback to selected nodes
      if (editorContainerRef.current) {
        // Remove previous selection highlights
        const previouslySelected = editorContainerRef.current.querySelectorAll(".selection-highlight");
        previouslySelected.forEach((el) => {
          el.classList.remove("selection-highlight");
        });

        // Add selection highlights to new selection
        nodeIds.forEach((nodeId) => {
          const nodeElement = editorContainerRef.current?.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            nodeElement.classList.add("selection-highlight");
          }
        });
      }
    },
    [onNodesSelected]
  );

  const getNodesInArea = useCallback(
    (rect: SelectionRect): string[] => {
      if (!editorContainerRef.current) return [];
      return getNodesInSelectionArea(rect, editorContainerRef.current);
    },
    []
  );

  return (
    <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "#1e1e1e" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#ffffff" }}>
        Node Editor with Selection Area
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#2d2d30", color: "#ffffff" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • Hold down the middle mouse button and drag to select nodes
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • Selected nodes will be highlighted with a blue border
        </Typography>
        <Typography variant="body2">
          • Check the console for selection details
        </Typography>
      </Paper>

      <NodeSelectionArea
        onNodeSelection={handleNodeSelection}
        getNodesInArea={getNodesInArea}
        style={{
          minHeight: "500px",
          border: "2px solid #464647",
          borderRadius: "4px",
          backgroundColor: "#383838",
          position: "relative",
        }}
      >
        <div 
          ref={editorContainerRef}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          {/* Example node elements */}
          {Array.from({ length: 8 }).map((_, index) => (
            <Box
              key={index}
              data-node-id={`node-${index + 1}`}
              sx={{
                position: "absolute",
                left: `${20 + (index % 4) * 150}px`,
                top: `${50 + Math.floor(index / 4) * 120}px`,
                width: "120px",
                height: "80px",
                backgroundColor: "#464647",
                border: "2px solid transparent",
                borderRadius: "8px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&.selection-highlight": {
                  borderColor: "#007acc",
                  backgroundColor: "#555",
                  transform: "scale(1.02)",
                },
                "&:hover": {
                  backgroundColor: "#555",
                },
              }}
            >
              <Typography variant="body2">
                Node {index + 1}
              </Typography>
            </Box>
          ))}
          
          <Typography 
            variant="body2" 
            sx={{ 
              position: "absolute", 
              bottom: "20px", 
              left: "20px", 
              color: "#cccccc" 
            }}
          >
            Middle-click and drag to select nodes
          </Typography>
        </div>
      </NodeSelectionArea>

      <style>
        {`
          .selection-highlight {
            border-color: #007acc !important;
            background-color: #555 !important;
            transform: scale(1.02) !important;
          }
        `}
      </style>
    </Box>
  );
};

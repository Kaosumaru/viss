import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { SelectionArea } from "./SelectionArea";
import type { SelectionRect } from "./SelectionArea";

export const SelectionAreaDemo: React.FC = () => {
  const [currentSelection, setCurrentSelection] =
    useState<SelectionRect | null>(null);
  const [lastCompletedSelection, setLastCompletedSelection] =
    useState<SelectionRect | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  const handleSelectionChange = (rect: SelectionRect | null) => {
    setCurrentSelection(rect);
  };

  const handleSelectionComplete = (rect: SelectionRect) => {
    setLastCompletedSelection(rect);
    console.log("Selection completed:", rect);
  };

  const formatRect = (rect: SelectionRect | null) => {
    if (!rect) return "None";

    const left = Math.min(rect.startX, rect.endX);
    const top = Math.min(rect.startY, rect.endY);
    const width = Math.abs(rect.endX - rect.startX);
    const height = Math.abs(rect.endY - rect.startY);

    return `x: ${left.toFixed(0)}, y: ${top.toFixed(0)}, w: ${width.toFixed(
      0
    )}, h: ${height.toFixed(0)}`;
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "#1e1e1e" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#ffffff" }}>
        Selection Area Demo
      </Typography>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#2d2d30", color: "#ffffff" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Instructions:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • Hold down the middle mouse button and drag to create a selection
          area
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • The selection area will appear as a dashed blue rectangle
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          • Release the middle mouse button to complete the selection
        </Typography>

        <Button
          variant="contained"
          onClick={() => setIsEnabled(!isEnabled)}
          sx={{ mb: 2 }}
        >
          {isEnabled ? "Disable" : "Enable"} Selection
        </Button>

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Current Selection:</strong> {formatRect(currentSelection)}
        </Typography>
        <Typography variant="body2">
          <strong>Last Completed:</strong> {formatRect(lastCompletedSelection)}
        </Typography>
      </Paper>

      <SelectionArea
        onSelectionChange={handleSelectionChange}
        onSelectionComplete={handleSelectionComplete}
        disabled={!isEnabled}
        style={{
          minHeight: "400px",
          border: "2px solid #464647",
          borderRadius: "4px",
          backgroundColor: "#383838",
        }}
      >
        <Box sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#ffffff" }}>
            Selection Area
          </Typography>
          <Typography variant="body2" sx={{ color: "#cccccc", mb: 2 }}>
            This is the content inside the selection area. You can middle-click
            and drag to select regions.
          </Typography>

          {/* Some demo content to select */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2,
              mt: 3,
            }}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#464647",
                  color: "#ffffff",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#555",
                  },
                }}
              >
                Item {index + 1}
              </Paper>
            ))}
          </Box>
        </Box>
      </SelectionArea>
    </Box>
  );
};

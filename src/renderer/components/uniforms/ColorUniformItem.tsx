import React, { useState } from "react";
import { Box, Typography, IconButton, Popover } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import type { UniformItemProps } from "./UniformItem";
import type { Color } from "@graph/parameter";
import { ColorPicker } from "../visualizers/color/ColorPicker";
import { colorToCSS, rgbaToHex } from "../visualizers/color/utils";

const ColorUniformItem: React.FC<UniformItemProps> = ({
  name,
  uniform,
  onChangeValue,
  onRemove,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // The value is stored in uniform.defaultValue?.value (if type is color)
  const colorValue: Color =
    uniform.defaultValue && uniform.defaultValue.type === "color"
      ? uniform.defaultValue.value
      : [1, 1, 1, 1]; // Default white color

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (newColor: Color) => {
    if (uniform.defaultValue && uniform.defaultValue.type === "color") {
      onChangeValue({ ...uniform.defaultValue, value: newColor });
    } else {
      onChangeValue({ type: "color", value: newColor });
    }
  };

  const open = Boolean(anchorEl);

  // For display, we'll show just RGB part of the hex (not alpha)
  const displayHex = rgbaToHex(colorValue).substring(0, 7);

  return (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name}{" "}
        <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>

      {/* Color preview button */}
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          padding: 1,
          border: "1px solid #555",
          borderRadius: 1,
          backgroundColor: "#2d2d30",
          "&:hover": {
            backgroundColor: "#3e3e42",
          },
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            border: "1px solid #666",
            borderRadius: 1,
            flexShrink: 0,
            // Checkerboard pattern for transparency preview
            backgroundImage: `
              linear-gradient(45deg, #666 25%, transparent 25%), 
              linear-gradient(-45deg, #666 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #666 75%), 
              linear-gradient(-45deg, transparent 75%, #666 75%)
            `,
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: colorToCSS(colorValue),
              borderRadius: 1,
            }}
          />
        </Box>
        <Box
          sx={{ fontSize: "0.8rem", color: "#fff", fontFamily: "monospace" }}
        >
          {displayHex}
        </Box>
      </Box>

      <IconButton
        aria-label="delete"
        size="small"
        color="error"
        onClick={() => {
          onRemove(name);
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      {/* Color picker popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ColorPicker color={colorValue} onChange={handleColorChange} />
      </Popover>
    </Box>
  );
};

export default ColorUniformItem;
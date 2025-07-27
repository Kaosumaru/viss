import { useState, useEffect } from "react";
import { Box, Popover } from "@mui/material";
import { CustomParamControl } from "../customParamControl";
import type { Color, ParameterValue } from "@graph/parameter";
import type { Parameter } from "@compiler/nodes/compilerNode";
import { colorToCSS, rgbaToHex } from "./utils";
import { ColorPicker } from "./ColorPicker";

export class ColorControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(
      value ?? {
        type: "color",
        value: [1, 1, 1, 1],
      },
      parameter,
      onChange
    );
  }
}

export function CustomColorControl(props: { data: ColorControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const colorValue =
    value.type === "color" ? value.value : ([1, 1, 1, 1.0] as Color);

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (newColor: Color) => {
    control.value = {
      type: "color",
      value: newColor,
    };
    setValue(control.value);
    control.onChange?.(control.value);
  };

  const open = Boolean(anchorEl);
  const displayText = rgbaToHex(colorValue);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {control.parameter.description && (
        <Box sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {control.parameter.description}
        </Box>
      )}

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
          {displayText}
        </Box>
      </Box>

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
}

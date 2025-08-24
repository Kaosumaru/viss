import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { NumberValue } from "../../../compiler/graph/parameter";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import { NumberInputField } from "../NumberInputField";
import type { UniformItemProps } from "./UniformItem";

const FloatUniformItem: React.FC<UniformItemProps> = ({ name, uniform, onChange, onRemove }) => {
  // The value is stored in uniform.defaultValue?.value (if type is number)
  const value = (uniform.defaultValue && uniform.defaultValue.type === "number")
    ? (uniform.defaultValue as NumberValue).value
    : 0.0;

  const handleValueChange = (val: number) => {
    if (uniform.defaultValue && uniform.defaultValue.type === "number") {
      onChange({ ...uniform, defaultValue: { ...uniform.defaultValue, value: val } });
    } else {
      onChange({ ...uniform, defaultValue: { type: "number", value: val } });
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name} <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>
      <NumberInputField
        value={value}
        onChange={handleValueChange}
        allowFloat={true}
      />
      <IconButton
        aria-label="delete"
        size="small"
        color="error"
        onClick={() => onRemove(name)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default FloatUniformItem;

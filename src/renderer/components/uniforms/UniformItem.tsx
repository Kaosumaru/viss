import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Uniform } from "../../../compiler/graph/uniform";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import type { ParameterValue } from "@graph/parameter";

export interface UniformItemProps {
  name: string;
  uniform: Uniform;
  onChange: (uniform: Uniform) => void;
  onChangeValue: (defaultValue: ParameterValue) => void;
  onRemove: (name: string) => void;
}

const UniformItem: React.FC<UniformItemProps> = ({
  name,
  uniform,
  onRemove,
}) => {
  return (
    <Box display="flex" alignItems="center" mb={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name}{" "}
        <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>
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

export default UniformItem;

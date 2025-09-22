import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { VectorInputField } from "../VectorInputField";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import type { UniformItemProps } from "./UniformItem";
import { useEffect, useState } from "react";

export interface BaseVectorUniformItemProps extends UniformItemProps {
  dimensions: 2 | 3 | 4;
}

const BaseVectorUniformItem: React.FC<BaseVectorUniformItemProps> = ({
  name,
  uniform,
  onChangeValue,
  onRemove,
  dimensions,
}) => {
  const [values, setValues] = useState(new Array(dimensions).fill(0));

  useEffect(() => {
    if (uniform.defaultValue && uniform.defaultValue.type === "vector") {
      setValues(uniform.defaultValue.value);
    }
  }, [uniform]);

  const handleValueChange = (newValues: number[]) => {
    if (uniform.defaultValue && uniform.defaultValue.type === "vector") {
      onChangeValue({ ...uniform.defaultValue, value: newValues });
    } else {
      onChangeValue({ type: "vector", value: newValues });
    }
    setValues(newValues);
  };

  const labels = ["x", "y", "z", "w"].slice(0, dimensions);

  return (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name}{" "}
        <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>
      <VectorInputField
        values={values}
        onChange={handleValueChange}
        allowFloat={true}
        labels={labels}
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

export default BaseVectorUniformItem;

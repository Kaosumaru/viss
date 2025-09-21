import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { VectorInputField } from "../VectorInputField";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import type { UniformItemProps } from "./UniformItem";
import type { VectorValue } from "../../../compiler/graph/parameter";

const Vec2UniformItem: React.FC<UniformItemProps> = ({
  name,
  uniform,
  onChangeValue,
  onRemove,
}) => {
  // Default values for vec2
  const defaultValues = [0.0, 0.0];
  
  // The value is stored in uniform.defaultValue?.value (if type is vector)
  const values =
    uniform.defaultValue && uniform.defaultValue.type === "vector"
      ? (uniform.defaultValue as VectorValue).value
      : defaultValues;

  const handleValueChange = (newValues: number[]) => {
    if (uniform.defaultValue && uniform.defaultValue.type === "vector") {
      onChangeValue({ ...uniform.defaultValue, value: newValues });
    } else {
      onChangeValue({ type: "vector", value: newValues });
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name}{" "}
        <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>
      <VectorInputField
        values={values.length === 2 ? values : defaultValues}
        onChange={handleValueChange}
        allowFloat={true}
        labels={["x", "y"]}
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

export default Vec2UniformItem;
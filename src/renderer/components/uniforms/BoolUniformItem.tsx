import { Box, Typography, IconButton, Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { BooleanValue } from "../../../compiler/graph/parameter";
import { typeToName } from "../../../compiler/glsl/types/typeToString";
import type { UniformItemProps } from "./UniformItem";

const BoolUniformItem: React.FC<UniformItemProps> = ({
  name,
  uniform,
  onChangeValue,
  onRemove,
}) => {
  // The value is stored in uniform.defaultValue?.value (if type is boolean)
  const value =
    uniform.defaultValue && uniform.defaultValue.type === "boolean"
      ? (uniform.defaultValue as BooleanValue).value
      : false;

  const handleValueChange = (checked: boolean) => {
    if (uniform.defaultValue && uniform.defaultValue.type === "boolean") {
      onChangeValue({ ...uniform.defaultValue, value: checked });
    } else {
      onChangeValue({ type: "boolean", value: checked });
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={1} gap={1}>
      <Typography variant="body1" sx={{ flex: 1 }}>
        {name}{" "}
        <span style={{ color: "#aaa" }}>({typeToName(uniform.type)})</span>
      </Typography>
      <Checkbox
        checked={value}
        onChange={(e) => handleValueChange(e.target.checked)}
        sx={{
          color: "#aaa",
          "&.Mui-checked": {
            color: "#c9b144",
          },
        }}
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

export default BoolUniformItem;
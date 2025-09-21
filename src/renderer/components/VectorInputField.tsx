import { Box, Checkbox, Tooltip } from "@mui/material";
import { NumberInputField } from "./NumberInputField";

export interface VectorInputFieldProps {
  values: number[];
  onChange: (values: number[]) => void;
  allowFloat?: boolean;
  labels?: string[]; // Optional labels for each component (e.g., ["x", "y", "z", "w"])
  useDefault?: boolean;
  onUseDefaultChange?: (useDefault: boolean) => void;
}

export function VectorInputField({
  values,
  onChange,
  allowFloat = true,
  labels = ["x", "y", "z", "w"],
  useDefault = false,
  onUseDefaultChange,
}: VectorInputFieldProps) {
  const handleChange = (index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {values.map((value, index) => (
        <Tooltip key={index} title={labels[index] || ""}>
          <Box>
            <NumberInputField
              value={value}
              onChange={(newValue) => handleChange(index, newValue)}
              allowFloat={allowFloat}
            />
          </Box>
        </Tooltip>
      ))}
      {onUseDefaultChange && (
        <Tooltip title="Use default value">
          <Checkbox
            checked={useDefault}
            onChange={(e) => onUseDefaultChange(e.target.checked)}
            size="small"
            sx={{
              color: "#aaa",
              "&.Mui-checked": {
                color: "#c9b144",
              },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
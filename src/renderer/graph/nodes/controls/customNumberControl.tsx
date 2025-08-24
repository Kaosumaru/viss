import { useState, useEffect, useRef, memo } from "react";
import { Box } from "@mui/material";
import { NumberControl } from "./customParamControl";
import { Drag } from "rete-react-plugin";
import { NumberInputField } from "renderer/components/NumberInputField";

function CustomNumberControlInternal(props: { data: NumberControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);
  const ref = useRef(null);
  Drag.useNoDrag(ref);

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleChange = (num: number) => {
    if (control.value.type === "number" && control.value.value !== num) {
      control.value = {
        type: "number",
        value: num,
      };
      setValue(control.value);
      control.onChange?.(control.value);
    }
  };

  return (
    <Box ref={ref} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {control.parameter.description && (
        <Box sx={{ fontSize: "0.8rem", color: "#ccc" }}>
          {control.parameter.description}
        </Box>
      )}
      <NumberInputField
        value={value.type === "number" ? value.value : 0}
        onChange={handleChange}
        allowFloat={true}
      />
    </Box>
  );
}

export const CustomNumberControl = memo(CustomNumberControlInternal);

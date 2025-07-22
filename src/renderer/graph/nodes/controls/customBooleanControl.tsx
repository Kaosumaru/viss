import { useState, useEffect } from "react";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { ClassicPreset } from "rete";
import type { Parameter } from "@compiler/nodes/compilerNode";

export class BooleanControl extends ClassicPreset.Control {
  value: boolean;
  parameter: Parameter;
  onChange?: (value: boolean) => void;

  constructor(
    value: boolean,
    parameter: Parameter,
    onChange?: (value: boolean) => void
  ) {
    super();
    this.value = value;
    this.parameter = parameter;
    this.onChange = onChange;
  }
}

export function CustomBooleanControl(props: { data: BooleanControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setValue(newValue);
    control.value = newValue;
    control.onChange?.(newValue);
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={value}
            onChange={handleChange}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#c9b144",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#c9b144",
              },
            }}
          />
        }
        label={control.parameter.description || ""}
      />
    </FormGroup>
  );
}

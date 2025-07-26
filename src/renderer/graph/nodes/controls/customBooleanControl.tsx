import { useState, useEffect } from "react";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { CustomParamControl } from "./customParamControl";
import type { ParameterValue } from "@graph/parameter";
import type { Parameter } from "@compiler/nodes/compilerNode";

export class BooleanControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(value ?? { type: "boolean", value: false }, parameter, onChange);
  }
}

export function CustomBooleanControl(props: { data: BooleanControl }) {
  const control = props.data;
  const [value, setValue] = useState(control.value);
  const boolValue = value.type === "boolean" ? value.value : false;

  useEffect(() => {
    setValue(control.value);
  }, [control.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    control.value = {
      type: "boolean",
      value: newValue,
    };
    setValue(control.value);
    control.onChange?.(control.value);
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={boolValue}
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

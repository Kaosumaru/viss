import { useState, useEffect } from "react";
import { Switch } from "@mui/material";
import { ClassicPreset } from "rete";

export class BooleanControl extends ClassicPreset.Control {
  value: boolean;
  onChange?: (value: boolean) => void;

  constructor(value: boolean, onChange?: (value: boolean) => void) {
    super();
    this.value = value;
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
    console.log("BooleanControl changed:", event.target.checked);
    const newValue = event.target.checked;
    setValue(newValue);
    control.value = newValue;
    control.onChange?.(newValue);
  };

  return (
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
  );
}

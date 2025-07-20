import { useRef, useState, useEffect } from "react";
import { Switch, FormControlLabel } from "@mui/material";
import type { RenderEmit } from "rete-react-plugin";
import type { Schemes } from "../node";
import { ClassicPreset } from "rete";

type Props = {
  emit: RenderEmit<Schemes>;
  payload: ClassicPreset.Control;
};

export class BooleanControl extends ClassicPreset.Control {
  value: boolean;
  onChange?: (value: boolean) => void;

  constructor(value: boolean, onChange?: (value: boolean) => void) {
    super();
    this.value = value;
    this.onChange = onChange;
  }
}

export function CustomBooleanControl({ payload }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const control = payload as BooleanControl;
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
    <div ref={ref} style={{ padding: "4px 8px" }}>
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
        label=""
        sx={{
          margin: 0,
          "& .MuiFormControlLabel-label": {
            fontSize: "14px",
            color: "white",
          },
        }}
      />
    </div>
  );
}

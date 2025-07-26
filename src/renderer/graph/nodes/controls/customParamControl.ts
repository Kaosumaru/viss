import { ClassicPreset } from "rete";
import type { Parameter } from "@compiler/nodes/compilerNode";
import type { ParameterValue } from "@graph/parameter";

export class CustomParamControl extends ClassicPreset.Control {
  value: ParameterValue;
  parameter: Parameter;
  onChange?: (value: ParameterValue) => void;

  constructor(
    value: ParameterValue,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super();
    this.value = value;
    this.parameter = parameter;
    this.onChange = onChange;
  }
}

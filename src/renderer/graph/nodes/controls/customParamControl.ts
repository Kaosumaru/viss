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

export class BooleanControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(value ?? { type: "boolean", value: false }, parameter, onChange);
  }
}

export class NumberControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(value ?? { type: "number", value: 0 }, parameter, onChange);
  }
}

export class PreviewControl extends ClassicPreset.Control {
  nodeId: string;
  shader?: string;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
  }
}

export class ColorControl extends CustomParamControl {
  constructor(
    value: ParameterValue | undefined,
    parameter: Parameter,
    onChange?: (value: ParameterValue) => void
  ) {
    super(
      value ?? {
        type: "color",
        value: [1, 1, 1, 1],
      },
      parameter,
      onChange
    );
  }
}

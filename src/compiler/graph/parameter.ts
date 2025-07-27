export interface NumberValue {
  type: "number";
  value: number;
}

export interface BooleanValue {
  type: "boolean";
  value: boolean;
}

export interface StringValue {
  type: "string";
  value: string;
}

export interface ColorValue {
  type: "color";
  value: string; // HEX color value like "#ff0000"
}

export type ParameterValue =
  | NumberValue
  | BooleanValue
  | StringValue
  | ColorValue;
export type ParameterValueType = ParameterValue["type"];

export interface Parameters {
  [key: string]: ParameterValue;
}

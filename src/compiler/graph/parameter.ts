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

export type Color = [number, number, number, number]; // RGBA format
export interface ColorValue {
  type: "color";
  value: Color;
}

export interface VectorValue {
  type: "vector";
  value: number[];
}

export type ParameterValue =
  | NumberValue
  | BooleanValue
  | StringValue
  | ColorValue
  | VectorValue;
  
export type ParameterValueType = ParameterValue["type"];

export interface Parameters {
  [key: string]: ParameterValue;
}

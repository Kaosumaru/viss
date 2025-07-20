export interface NumberValue {
  type: "number";
  value: number;
}

export interface BooleanValue {
  type: "boolean";
  value: boolean;
}

export type ParameterValue = NumberValue | BooleanValue;
export type ParameterValueType = ParameterValue["type"];

export interface Parameters {
  [key: string]: ParameterValue;
}

export interface NumberValue {
  type: "number";
  value: number;
}

export type ParameterValue = NumberValue;
export type ParameterValueType = ParameterValue["type"];

export interface Parameters {
  [key: string]: ParameterValue;
}

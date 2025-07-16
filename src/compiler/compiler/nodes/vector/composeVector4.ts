import { scalar, vector } from "@glsl/types";
import {
  CompilerNode,
  type NodeContext,
  type ParameterInfo,
} from "../compilerNode";
import type { Context } from "@compiler/context";

class ComposeVector4 extends CompilerNode {
  constructor() {
    super();
    this.inputs.x = scalar("float");
    this.inputs.y = scalar("float");
    this.inputs.z = scalar("float");
    this.inputs.w = scalar("float");

    const param: ParameterInfo = {
      type: "number",
      defaultValue: { type: "number", value: 0 },
    };
    this.parameters.x = param;
    this.parameters.y = param;
    this.parameters.z = param;
    this.parameters.w = param;
    this.outputs.out = vector("float", 4);
  }

  override compile(node: NodeContext): Context {
    const x = this.getInputOrParamValue(node, "x");
    const y = this.getInputOrParamValue(node, "y");
    const z = this.getInputOrParamValue(node, "z");
    const w = this.getInputOrParamValue(node, "w");

    return {
      type: this.outputs.out,
      mainOutput: `vec4(${x}, ${y}, ${z}, ${w})`,
    };
  }

  getInputOrParamValue(node: NodeContext, name: string): string {
    if (node.hasInput(name)) {
      const input = node.getInput(name);
      if (input.type.id === "scalar" && input.type.type === "float") {
        return input.mainOutput;
      }
      throw new Error(`Input ${name} is not of type number`);
    } else {
      const value = node.getParamValue(name, "number");
      return value.toLocaleString("en-GB", { minimumFractionDigits: 1 });
    }
  }

  override getLabel(): string {
    return "Compose Vec4";
  }
}

export const composeVector4 = new ComposeVector4();

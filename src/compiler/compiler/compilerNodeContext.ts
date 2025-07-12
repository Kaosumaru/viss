import type { ParameterValueType } from "@graph/parameter";
import type { Context } from "./context";
import type { NodeContext } from "./nodes/compilerNode";
import type { Node } from "@graph/node";
import type { Compiler } from "./compiler";

export class CompileNodeContext implements NodeContext {
  constructor(compiler: Compiler, node: Node) {
    this.compiler = compiler;
    this.node = node;
  }
  getInput(name: string): Context {
    return this.compiler.compile(name);
  }
  tryGetParamValue<T extends ParameterValueType>(name: string, type: T) {
    const param = this.node.parameters[name];
    if (!param) {
      return undefined;
    }
    if (param.type !== type) {
      throw new Error(
        `Parameter ${name} expected type ${type}, but got ${param.type}`
      );
    }
    return param.value;
  }
  getParamValue<T extends ParameterValueType>(name: string, type: T) {
    const value = this.tryGetParamValue(name, type);
    if (value === undefined) {
      throw new Error(
        `Parameter ${name} not found or of incorrect type in node ${this.node.identifier}`
      );
    }
    return value;
  }

  protected compiler: Compiler;
  protected node: Node;
}

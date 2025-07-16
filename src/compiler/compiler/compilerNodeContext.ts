import type { ParameterValueType } from "@graph/parameter";
import type { Context } from "./context";
import type { NodeContext } from "./nodes/compilerNode";
import type { Node } from "@graph/node";
import type { Compiler } from "./compiler";
import type { GraphHelper } from "./graphHelper";

export class CompileNodeContext implements NodeContext {
  constructor(compiler: Compiler, graph: GraphHelper, node: Node) {
    this.compiler = compiler;
    this.graph = graph;
    this.node = node;
  }

  tryGetInput(name: string): Context | undefined {
    const node = this.graph.getInputNode(this.node.identifier, name);
    if (!node) {
      return undefined;
    }
    return this.compiler.compile(node.identifier);
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

  protected compiler: Compiler;
  protected node: Node;
  protected graph: GraphHelper;
}

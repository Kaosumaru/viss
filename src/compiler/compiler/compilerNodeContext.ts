import type { ParameterValueType } from "@graph/parameter";
import type { Expression as Expression, Variable } from "./context";
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

  tryGetInput(name: string): Expression | undefined {
    const input = this.graph.getInputNode(this.node.identifier, name);
    if (!input) {
      return undefined;
    }
    const ctx = this.compiler.compile(input.node.identifier);
    const out = ctx.outputs[input.socketId];
    if (!out) {
      return undefined;
    }
    return out;
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

  createVariable(expr: Expression): Expression {
    const variableName = `var_${this.node.identifier}_${this.variables.length}`;
    const variable: Variable = {
      name: variableName,
      type: expr.type,
      data: expr.data,
    };
    this.variables.push(variable);
    return {
      data: variableName,
      type: expr.type,
      trivial: true,
    };
  }

  info(): string {
    return `${this.node.nodeType}/${this.node.identifier}`;
  }

  protected compiler: Compiler;
  protected node: Node;
  protected graph: GraphHelper;
  protected variables: Variable[] = [];
}

import { Any } from "@glsl/types";
import { CompilerNode, type NodeContext, type NodeInfo, type Pins } from "../compilerNode";
import type { Context } from "@compiler/context";

class GlslFunction extends CompilerNode {
  constructor() {
    super();

    this.addParameter("_identifier", "string");
  }

  public inputs(): Pins {
    return [];
  }

  public outputs(): Pins {
    return [];
  }

  override compile(node: NodeContext): Context {
    return this.createOutput(node, {
      data: `1`,
      type: Any,
      trivial: true,
    });
  }

  override getLabel(): string {
    return `Custom Function`;
  }

  override getDescription(): string {
    return `Custom Function`;
  }

  override getInfo(node: NodeContext): NodeInfo {
    const funcName = node.tryGetParamValue("_identifier", "string");
    const funcDef = node.tryGetFunctionDefinition(funcName || "");
    if (!funcName || !funcDef) {
      return {
        name: "INVALID",
        description: !funcName ? "Function name is not set" : `Function "${funcName}" not found`,
        showPreview: false,
        inputs: [],
        outputs: [],
        parameters: [],
      };
    }

    const inputs = funcDef.parameters.filter((param) => param.mode === "in" || param.mode === "inout").map((param) => ({
      name: param.name,
      type: param.type,
    }));

    const outputs = funcDef.parameters.filter((param) => param.mode === "out" || param.mode === "inout").map((param) => ({
      name: param.name,
      type: param.type,
    }));

    if (funcDef.returnType) {
      outputs.push({
        name: "out",
        type: funcDef.returnType,
      });
    }

    return {
      name: funcName,
      description: "Custom Function",
      showPreview: false,
      inputs,
      outputs,
      parameters: [],
    };
  }
}

export const glslFunction = new GlslFunction();

import {
  CompilerNode,
  type NodeContext,
  type NodeInfo,
  type Pins,
} from "../compilerNode";
import type { Context, Expression } from "@compiler/context";
import type { FunctionDefinition } from "@glsl/function";
import { defaultExpressionForType } from "@glsl/types/defaultExpressionForType";

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
    const funcName = node.tryGetParamValue("_identifier", "string");
    const funcDef = node.tryGetFunctionDefinition(funcName || "");

    if (!funcName || !funcDef) {
      throw new Error(`Function "${funcName}" not found`);
    }

    if (!funcDef.returnType) {
      throw new Error(`Function "${funcName}" must have a return type`);
    }

    const params = this.buildParameterList(node, funcDef);
    const call = `${funcName}(${params})`;
    const outExpression: Expression = {
      data: call,
      type: funcDef.returnType,
      trivial: false,
    };

    return this.createDynamicOutputs(node, [["out", outExpression]]);
  }

  override getLabel(): string {
    return `Custom Function`;
  }

  override getDescription(): string {
    return `Custom Function`;
  }

  public override canImplicitlyCastInput() {
    return false;
  }

  protected buildParameterList(
    node: NodeContext,
    func: FunctionDefinition
  ): string {
    return func.parameters
      .map((param) => {
        if (param.mode === "out" || param.mode === "inout") {
          throw new Error(
            `Output parameters are not supported in function "${func.name}"`
          );
        }
        let value = node.tryGetInput(param.name);
        if (value === undefined) {
          value = defaultExpressionForType(param.type);
        }
        // TODO check type
        // TODO handle out, and inout params
        return value.data;
      })
      .join(", ");
  }

  override getInfo(node: NodeContext): NodeInfo {
    const funcName = node.tryGetParamValue("_identifier", "string");
    const funcDef = node.tryGetFunctionDefinition(funcName || "");
    if (!funcName || !funcDef) {
      const errorMessage = !funcName
        ? "Function name is not set"
        : `Function "${funcName}" not found`;
      return {
        name: "INVALID",
        description: errorMessage,
        showPreview: false,
        inputs: [],
        outputs: [],
        parameters: [],
        errorMessage,
      };
    }

    const inputs = funcDef.parameters
      .filter((param) => param.mode === "in" || param.mode === "inout")
      .map((param) => ({
        name: param.name,
        type: param.type,
      }));

    const outputs = funcDef.parameters
      .filter((param) => param.mode === "out" || param.mode === "inout")
      .map((param) => ({
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
      showPreview: funcDef.pragmas.has("preview"),
      inputs,
      outputs,
      parameters: [],
    };
  }
}

export const glslFunction = new GlslFunction();

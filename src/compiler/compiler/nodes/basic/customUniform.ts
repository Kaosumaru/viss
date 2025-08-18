import { CompilerNode, type NodeContext, type NodeInfo } from "../compilerNode";
import type { Context } from "@compiler/context";

export class CustomUniform extends CompilerNode {
  constructor() {
    super();
    this.addParameter("_identifier", "string");
  }

  override compile(node: NodeContext): Context {
    const uniformName = node.tryGetParamValue("_identifier", "string");
    const uniform = node.tryGetUniform(uniformName || "");
    if (!uniform || !uniformName) {
      throw new Error(`Uniform "${uniformName}" not found`);
    }

    return this.createOutput(node, {
      data: uniform.id,
      type: uniform.type,
      trivial: true,
    });
  }

  override getInfo(node: NodeContext): NodeInfo {
    const uniformName = node.tryGetParamValue("_identifier", "string");
    const uniform = node.tryGetUniform(uniformName || "");

    if (!uniform || !uniformName) {
      return {
        name: uniformName ?? "Missing name",
        description: this.getDescription(),
        inputs: [],
        outputs: [],
        parameters: [],
        errorMessage: `Uniform "${uniformName}" not found`,
      };
    }

    return {
      name: uniformName ?? "Missing name",
      description: this.getDescription(),
      inputs: [],
      outputs: [{ name: "out", type: uniform.type }],
      parameters: [],
    };
  }

  override getLabel(): string {
    return `Uniform`;
  }

  override getDescription(): string {
    return `Uniform`;
  }
}

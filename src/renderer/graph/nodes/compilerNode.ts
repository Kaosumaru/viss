import { getNode, type NodeType } from "@compiler/nodes/allNodes";
import type { CompilerNode } from "@compiler/nodes/compilerNode";
import { ClassicPreset } from "rete";

export class UICompilerNode extends ClassicPreset.Node {
  height = 140;
  width = 200;
  nodeType: NodeType;

  constructor(nodeType: NodeType) {
    const compilerNode = getNode(nodeType);
    super(compilerNode.getLabel());

    this.nodeType = nodeType;
    this.addInputs(compilerNode);
    this.addParams(compilerNode);
    this.addOutputs(compilerNode);

    this.updateSize();
  }

  protected addOutputs(compilerNode: CompilerNode) {
    Object.entries(compilerNode.outputs).forEach(([name]) => {
      this.addOutput(
        name,
        new ClassicPreset.Output(new ClassicPreset.Socket(name), name)
      );
    });
  }

  protected addInputs(compilerNode: CompilerNode) {
    Object.entries(compilerNode.inputs).forEach(([name]) => {
      const input = new ClassicPreset.Input(
        new ClassicPreset.Socket(name),
        name
      );

      // If there's a parameter with the same name, add control to the input
      if (compilerNode.parameters[name]) {
        const param = compilerNode.parameters[name];
        input.addControl(
          new ClassicPreset.InputControl("number", {
            initial: param.defaultValue?.value || 0,
          })
        );
      }

      this.addInput(name, input);
    });
  }

  protected addParams(compilerNode: CompilerNode) {
    Object.entries(compilerNode.parameters).forEach(([name, value]) => {
      // Only add as standalone control if there's no input with the same name
      if (!compilerNode.inputs[name]) {
        this.addControl(
          name,
          new ClassicPreset.InputControl("number", {
            initial: value.defaultValue?.value || 0,
          })
        );
      }
    });
  }

  updateSize() {
    const inputs = Object.entries(this.inputs);
    const outputs = Object.entries(this.outputs);
    const controls = Object.entries(this.controls);

    this.height =
      40 +
      4 +
      5 +
      Math.max(inputs.length, outputs.length) * 36 +
      controls.length * 36;
  }
}

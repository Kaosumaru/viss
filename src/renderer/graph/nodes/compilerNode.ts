import type { CompilerNode } from "@compiler/nodes/compilerNode";
import { ClassicPreset } from "rete";

export class UICompilerNode extends ClassicPreset.Node {
  height = 140;
  width = 200;

  constructor(compilerNode: CompilerNode) {
    super(compilerNode.getLabel());

    this.addInputs(compilerNode);
    this.addParams(compilerNode);
    this.addOutputs(compilerNode);
  }

  protected addOutputs(compilerNode: CompilerNode) {
    Object.entries(compilerNode.outputs).forEach(([name]) => {
      this.addOutput(
        name,
        new ClassicPreset.Output(new ClassicPreset.Socket(name))
      );
    });
  }

  protected addInputs(compilerNode: CompilerNode) {
    Object.entries(compilerNode.inputs).forEach(([name]) => {
      this.addInput(
        name,
        new ClassicPreset.Input(new ClassicPreset.Socket(name))
      );
    });
  }

  protected addParams(compilerNode: CompilerNode) {
    Object.entries(compilerNode.parameters).forEach(([name, value]) => {
      this.addControl(
        name,
        new ClassicPreset.InputControl("number", {
          initial: value.defaultValue?.value || 0,
        })
      );
    });
  }
}

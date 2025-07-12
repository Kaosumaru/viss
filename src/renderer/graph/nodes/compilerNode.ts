import type { CompilerNode } from "@compiler/nodes/compilerNode";
import { ClassicPreset } from "rete";

export class UICompilerNode extends ClassicPreset.Node {
  height = 140;
  width = 200;

  constructor(compilerNode: CompilerNode) {
    super(compilerNode.getLabel());

    const socket = new ClassicPreset.Socket("socket");
    this.addControl("a", new ClassicPreset.InputControl("text", {}));
    this.addOutput("a", new ClassicPreset.Output(socket));
  }
}

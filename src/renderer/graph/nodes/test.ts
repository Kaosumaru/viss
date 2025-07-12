import { ClassicPreset } from "rete";

export class NodeA extends ClassicPreset.Node {
  height = 140;
  width = 200;

  constructor() {
    super("NodeA");

    const socket = new ClassicPreset.Socket("socket");
    this.addControl("a", new ClassicPreset.InputControl("text", {}));
    this.addOutput("a", new ClassicPreset.Output(socket));
  }
}

export class NodeB extends ClassicPreset.Node {
  height = 140;
  width = 200;

  constructor() {
    super("NodeB");

    const socket = new ClassicPreset.Socket("socket");
    this.addControl("b", new ClassicPreset.InputControl("text", {}));
    this.addInput("b", new ClassicPreset.Input(socket));
  }
}

import { getNode, type NodeType } from "@compiler/nodes/allNodes";
import type { CompilerNode } from "@compiler/nodes/compilerNode";
import { ClassicPreset } from "rete";
import { BooleanControl } from "./customBooleanControl";

export type ControlChangeCallback = (
  nodeId: string,
  controlKey: string,
  value: unknown
) => void;

export class UICompilerNode extends ClassicPreset.Node {
  height = 140;
  width = 200;
  nodeType: NodeType;
  private controlChangeCallback?: ControlChangeCallback;

  constructor(
    nodeType: NodeType,
    controlChangeCallback?: ControlChangeCallback
  ) {
    const compilerNode = getNode(nodeType);
    super(compilerNode.getLabel());

    this.nodeType = nodeType;
    this.controlChangeCallback = controlChangeCallback;
    this.addInputs(compilerNode);
    this.addParams(compilerNode);
    this.addOutputs(compilerNode);

    this.updateSize();
  }

  setControlChangeCallback(callback: ControlChangeCallback) {
    this.controlChangeCallback = callback;
    // Note: Controls created after this will use the new callback,
    // but existing controls won't be updated unless the node is recreated
  }

  protected addOutputs(compilerNode: CompilerNode) {
    compilerNode.outputs.forEach(({ name }) => {
      this.addOutput(
        name,
        new ClassicPreset.Output(new ClassicPreset.Socket(name), name)
      );
    });
  }

  protected addInputs(compilerNode: CompilerNode) {
    compilerNode.inputs.forEach(({ name }) => {
      const input = new ClassicPreset.Input(
        new ClassicPreset.Socket(name),
        name
      );

      // If there's a parameter with the same name, add control to the input
      const param = compilerNode.parameters.find((p) => p.name === name);
      if (param) {
        if (param.type === "boolean") {
          const control = new BooleanControl(
            (param.defaultValue?.value as boolean) || false,
            (value: boolean) => {
              this.controlChangeCallback?.(this.id, name, value);
            }
          );
          input.addControl(control);
        } else {
          const control = new ClassicPreset.InputControl("number", {
            initial: param.defaultValue?.value || 0,
            change: (value: unknown) => {
              this.controlChangeCallback?.(this.id, name, value);
            },
          });
          input.addControl(control);
        }
      }

      this.addInput(name, input);
    });
  }

  protected addParams(compilerNode: CompilerNode) {
    compilerNode.parameters.forEach(({ name, defaultValue, type }) => {
      // Only add as standalone control if there's no input with the same name
      const hasInput = compilerNode.inputs.some((input) => input.name === name);
      if (!hasInput) {
        if (type === "boolean") {
          const control = new BooleanControl(
            (defaultValue?.value as boolean) || false,
            (value: boolean) => {
              this.controlChangeCallback?.(this.id, name, value);
            }
          );
          this.addControl(name, control);
        } else {
          const control = new ClassicPreset.InputControl("number", {
            initial: defaultValue?.value || 0,
            change: (value: unknown) => {
              this.controlChangeCallback?.(this.id, name, value);
            },
          });
          this.addControl(name, control);
        }
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

import { getNode, type NodeType } from "@compiler/nodes/allNodes";
import type {
  CompilerNode,
  Parameter,
  Parameters,
  Pins,
} from "@compiler/nodes/compilerNode";
import { ClassicPreset } from "rete";
import { BooleanControl } from "./controls/customBooleanControl";
import { PreviewControl } from "./controls/customPreviewControl";
import type { CompilationHelper } from "../utils/compileGraph";

export type ControlChangeCallback = (
  nodeId: string,
  controlKey: string,
  value: unknown
) => void;

export class UICompilerNode extends ClassicPreset.Node {
  height = 140;
  width = 200;
  nodeType: NodeType;
  previewControl?: PreviewControl;
  private controlChangeCallback?: ControlChangeCallback;

  constructor(
    nodeType: NodeType,
    controlChangeCallback: ControlChangeCallback,
    compilationHelper: CompilationHelper
  ) {
    const compilerNode = getNode(nodeType);
    super(compilerNode.getLabel());

    this.compilationHelper = compilationHelper;
    this.nodeType = nodeType;
    this.controlChangeCallback = controlChangeCallback;

    const compiler = compilationHelper.getCompiler();
    const inputs = compilerNode.inputs(compiler);
    const params = compilerNode.parameters(compiler);
    const outputs = compilerNode.outputs(compiler);

    this.addInputs(inputs, params);
    this.addParams(inputs, params);
    this.addOutputs(outputs);

    if (compilerNode.showPreview()) {
      this.previewControl = new PreviewControl(this.id);
      this.addControl("preview", this.previewControl);
    }

    this.updateSize(compilerNode);
  }

  setControlChangeCallback(callback: ControlChangeCallback) {
    this.controlChangeCallback = callback;
    // Note: Controls created after this will use the new callback,
    // but existing controls won't be updated unless the node is recreated
  }

  protected addOutputs(outputs: Pins) {
    outputs
      .filter(({ name }) => name[0] != "_")
      .forEach(({ name }) => {
        this.addOutput(
          name,
          new ClassicPreset.Output(new ClassicPreset.Socket(name), name)
        );
      });
  }

  protected addInputs(inputs: Pins, params: Parameters) {
    inputs.forEach(({ name }) => {
      const input = new ClassicPreset.Input(
        new ClassicPreset.Socket(name),
        name
      );

      // If there's a parameter with the same name, add control to the input
      const param = params.find((p) => p.name === name);
      if (param) {
        const control = this.createControl(param);
        input.addControl(control);
      }

      this.addInput(name, input);
    });
  }

  protected addParams(inputs: Pins, params: Parameters) {
    params
      .filter((p) => p.name[0] !== "_")
      .forEach((param) => {
        // Only add as standalone control if there's no input with the same name
        const hasInput = inputs.some((input) => input.name === param.name);
        if (!hasInput) {
          const control = this.createControl(param);
          this.addControl(param.name, control);
        }
      });
  }

  protected createControl(param: Parameter): ClassicPreset.Control {
    const callback = (value: unknown) => {
      this.controlChangeCallback?.(this.id, param.name, value);
    };
    switch (param.type) {
      case "boolean":
        return new BooleanControl(
          (param.defaultValue?.value as boolean) || false,
          param,
          callback
        );
      case "number":
        return new ClassicPreset.InputControl("number", {
          initial: param.defaultValue?.value || 0,
          change: callback,
        });
      case "string":
        return new ClassicPreset.InputControl("text", {
          initial: param.defaultValue?.value || "",
          change: callback,
        });
    }
  }

  updateSize(compilerNode: CompilerNode) {
    const inputs = Object.entries(this.inputs);
    const outputs = Object.entries(this.outputs);
    const controls = Object.entries(this.controls);

    this.height =
      40 +
      4 +
      5 +
      Math.max(inputs.length, outputs.length) * 36 +
      controls.length * 36;

    if (compilerNode.showPreview()) {
      this.height += 140; // Add height for preview control
    }
  }

  protected compilationHelper: CompilationHelper;
}

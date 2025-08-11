import { getNode, type NodeType } from "@compiler/nodes/allNodes";
import type {
  NodeInfo,
  Parameter,
  Parameters,
  Pins,
} from "@compiler/nodes/compilerNode";
import type { Type } from "@glsl/types/types";
import { ClassicPreset } from "rete";
import type { CompilationHelper } from "../utils/compileGraph";
import type { ParameterValue } from "@graph/parameter";
import type { Parameters as GraphParameters } from "@graph/parameter";
import {
  BooleanControl,
  ColorControl,
  CustomParamControl,
  NumberControl,
  PreviewControl,
} from "./controls/customParamControl";

// Extend Socket to include GLSL type information
class SocketWithType extends ClassicPreset.Socket {
  glslType: Type;

  constructor(name: string, glslType: Type) {
    super(name);
    this.glslType = glslType;
  }
}

export type ControlChangeCallback = (
  nodeId: string,
  controlKey: string,
  value: ParameterValue
) => void;

export type CompileCallback = () => string | undefined;

export class UICompilerNode extends ClassicPreset.Node {
  height = 140;
  width = 200;
  showPreview = false;
  nodeType: NodeType;
  previewControl?: PreviewControl;
  errorMessage?: string;
  private controlChangeCallback: ControlChangeCallback;

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
  }

  public togglePreview() {
    this.showPreview = !this.showPreview;
    // Trigger parameter update to persist the state
    this.controlChangeCallback(this.id, "_showPreview", {
      type: "boolean",
      value: this.showPreview,
    });
  }

  public updateNode(description: NodeInfo, compile: CompileCallback) {
    this.label = description.name;
    this.errorMessage = description.errorMessage;

    for (const [key] of Object.entries(this.inputs)) {
      if (description.inputs.find((i) => i.name !== key)) {
        this.removeInput(key);
      }
    }

    this.addInputs(description.inputs, description.parameters);
    this.addParams(description.inputs, description.parameters);
    this.addOutputs(description.outputs);

    // Check if we should show preview (either from compiler node or from UI parameter)
    const shouldShowPreview = description.showPreview || this.showPreview;

    if (shouldShowPreview && !this.previewControl) {
      this.previewControl = new PreviewControl(this.id);
      this.previewControl.shader = compile();
      this.addControl("preview", this.previewControl);
    } else if (!shouldShowPreview && this.previewControl) {
      this.removeControl("preview");
      this.previewControl = undefined;
    }

    this.updateSize({ ...description, showPreview: shouldShowPreview });
  }

  protected addOutputs(outputs: Pins) {
    for (const [key] of Object.entries(this.outputs)) {
      if (!outputs.some((i) => i.name === key)) {
        this.removeOutput(key);
      }
    }

    for (const [name, socket] of Object.entries(this.outputs)) {
      const output = outputs.find(({ name: n }) => n === name);
      if (!output) continue;
      if (socket instanceof SocketWithType) {
        socket.glslType = output.type;
      }
    }

    outputs
      .filter(({ name }) => name[0] != "_")
      .filter(({ name }) => this.outputs[name] === undefined)
      .forEach(({ name, type }) => {
        const socket = new SocketWithType(name, type);
        this.addOutput(name, new ClassicPreset.Output(socket, name));
      });
  }

  protected addInputs(inputs: Pins, params: Parameters) {
    for (const [key] of Object.entries(this.inputs)) {
      if (!inputs.some((i) => i.name === key)) {
        this.removeInput(key);
      }
    }

    for (const [name, socket] of Object.entries(this.inputs)) {
      const input = inputs.find(({ name: n }) => n === name);
      if (!input) continue;
      if (socket instanceof SocketWithType) {
        socket.glslType = input.type;
      }
    }

    inputs
      .filter(({ name }) => this.inputs[name] === undefined)
      .forEach(({ name, type }) => {
        const socket = new SocketWithType(name, type);
        const input = new ClassicPreset.Input(socket, name);

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
      .filter(({ name }) => this.controls[name] === undefined)
      .forEach((param) => {
        // Only add as standalone control if there's no input with the same name
        const hasInput = inputs.some((input) => input.name === param.name);
        if (!hasInput) {
          const control = this.createControl(param);
          this.addControl(param.name, control);
        }
      });
  }

  public updateControls(parameters: GraphParameters) {
    for (const [key, control] of Object.entries(this.controls)) {
      const param = parameters[key];
      if (!param) {
        continue;
      }
      if (control instanceof CustomParamControl) {
        control.value = param;
      } else if (control instanceof ClassicPreset.InputControl) {
        control.value = param.value;
      }
    }

    // Handle the special _showPreview parameter
    if (parameters._showPreview?.type === "boolean") {
      this.showPreview = parameters._showPreview.value;
    }
  }

  protected createControl(param: Parameter): ClassicPreset.Control {
    const callback = (value: ParameterValue) => {
      this.controlChangeCallback(this.id, param.name, value);
    };
    switch (param.type) {
      case "boolean":
        return new BooleanControl(param.defaultValue, param, callback);
      case "color":
        return new ColorControl(param.defaultValue, param, callback);
      case "number":
        return new NumberControl(param.defaultValue, param, callback);
      case "string":
        return new ClassicPreset.InputControl("text", {
          initial: param.defaultValue?.value || "",
          change: (v) => callback({ type: "string", value: v as string }),
        });
    }
  }

  updateSize(description: NodeInfo) {
    const inputs = Object.entries(this.inputs);
    const outputs = Object.entries(this.outputs);
    const controls = Object.entries(this.controls);

    this.height =
      40 +
      4 +
      5 +
      Math.max(inputs.length, outputs.length) * 36 +
      controls.length * 36;

    if (description.showPreview) {
      this.height += 145; // Add height for preview control
    }
  }

  protected compilationHelper: CompilationHelper;
}

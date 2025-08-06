import * as vscode from "vscode";
import { VShaderEditorProvider } from "./vshaderEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(VShaderEditorProvider.register(context));
}

export function deactivate() {}

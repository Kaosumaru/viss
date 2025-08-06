import * as vscode from "vscode";
import { VShaderEditorPanel } from "./vshaderEditorPanel";

export function activate(context: vscode.ExtensionContext) {
  console.log("VShader Editor extension is now active!");

  const disposable = vscode.commands.registerCommand(
    "vshader.openEditor",
    () => {
      VShaderEditorPanel.createOrShow(context.extensionUri);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

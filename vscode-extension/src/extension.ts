import * as vscode from "vscode";
import { ViszEditorProvider } from "./viszEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(ViszEditorProvider.register(context));
}

export function deactivate() {}

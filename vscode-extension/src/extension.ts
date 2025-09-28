import * as vscode from "vscode";
import { VissEditorProvider } from "./vissEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(VissEditorProvider.register(context));
}

export function deactivate() {}

import * as vscode from "vscode";
import { VisEditorProvider } from "./visEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(VisEditorProvider.register(context));
}

export function deactivate() {}

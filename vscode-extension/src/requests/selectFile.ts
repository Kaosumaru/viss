import { ShowOpenFileDialogRequest } from "../messages/messages";
import * as vscode from "vscode";
import { postMessage } from "../utils/utils";

export async function selectFile(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  event: ShowOpenFileDialogRequest
) {
  const fileUris = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: event.params.label,
    filters: event.params.filters,
  });

  const relativePaths: string[] = [];
  const pathToDocument = document.uri;

  for (const uri of fileUris || []) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    const documentWorkspaceFolder =
      vscode.workspace.getWorkspaceFolder(pathToDocument);
    if (
      workspaceFolder?.uri.toString() !==
      documentWorkspaceFolder?.uri.toString()
    ) {
      vscode.window.showErrorMessage(
        "Please select a file within the current workspace."
      );
      continue;
    }

    // Make the uri relative
    relativePaths.push(vscode.workspace.asRelativePath(uri));
  }

  postMessage(webviewPanel, {
    type: "showOpenFileDialogResponse",
    requestId: event.requestId,
    params: {
      relativePaths,
    },
  });
}

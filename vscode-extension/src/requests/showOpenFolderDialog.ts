import * as vscode from "vscode";
import { postMessage } from "../utils/utils";
import { ShowOpenFolderDialogRequest } from "../messages/messages";

export async function showOpenFolderDialog(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  event: ShowOpenFolderDialogRequest
) {
  const fileUris = await vscode.window.showOpenFileDialog({
    canSelectMany: false,
    openLabel: event.params.label,
    canSelectFiles: false,
    canSelectFolders: true,
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
        "Please select a folder within the current workspace."
      );
      continue;
    }

    // Make the uri relative
    relativePaths.push(vscode.workspace.asRelativePath(uri));
  }

  postMessage(webviewPanel, {
    type: "showOpenFolderDialogResponse",
    requestId: event.requestId,
    params: {
      relativePaths,
    },
  });
}

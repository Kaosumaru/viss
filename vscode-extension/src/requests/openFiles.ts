import { OpenFilesRequest } from "../messages/messages";
import * as vscode from "vscode";
import { postMessage, relativeToAbsolutePath } from "../utils/utils";

export async function openFiles(
  document: vscode.TextDocument,
  webviewPanel: vscode.WebviewPanel,
  event: OpenFilesRequest
) {
  const contents: (string | null)[] = [];
  for (const path of event.params.relativePaths) {
    const fileUri = relativeToAbsolutePath(document, path);
    if (!fileUri) {
      contents.push(null);
      continue;
    }

    try {
      const fileData = await vscode.workspace.fs.readFile(fileUri);
      contents.push(Buffer.from(fileData).toString("utf8"));
    } catch {
      contents.push(null);
    }
  }

  postMessage(webviewPanel, {
    type: "openFilesResponse",
    requestId: event.requestId,
    params: {
      contents,
    },
  });
}

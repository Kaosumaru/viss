export interface AlertMessage {
  type: "alert";
  text: string;
}

export interface RefreshContentMessage {
  type: "refreshContent";
}

export interface SaveGraphMessage {
  type: "saveGraph";
  json: unknown;
  requestId?: number;
}

export interface ExportGraphResponseMessage {
  type: "exportGraphResponse";
  path: string;
  content?: string;
}

export interface EditorRequest {
  requestId: number;
  params?: unknown;
}

export interface ToWebviewURIRequest extends EditorRequest {
  type: "toWebviewURI";

  params: {
    relativepaths: string[];
  };
}

export interface ShowOpenFileDialogRequest extends EditorRequest {
  type: "showOpenFileDialog";

  params: {
    label: string;
    filters?: Record<string, string[]>;
  };
}

export interface ShowOpenFolderDialogRequest extends EditorRequest {
  type: "showOpenFolderDialog";

  params: {
    label: string;
  };
}

export interface OpenFilesRequest extends EditorRequest {
  type: "openFiles";

  params: {
    relativePaths: string[];
  };
}

export type EditorToExtensionMessage =
  | AlertMessage
  | RefreshContentMessage
  | SaveGraphMessage
  | ExportGraphResponseMessage
  | ShowOpenFileDialogRequest
  | ToWebviewURIRequest
  | ShowOpenFolderDialogRequest
  | OpenFilesRequest;

export interface LoadGraphMessage {
  type: "loadGraph";
  json: unknown;
  requestId?: number;
}

export interface ExportGraphRequestMessage {
  type: "exportGraphRequest";
  path: string;
}

export interface DisposeMessage {
  type: "dispose";
}

export interface ExtensionResponse {
  requestId: number;
  params?: unknown;
}

export interface ToWebviewURIResponse extends ExtensionResponse {
  type: "toWebviewURIResponse";

  params: {
    uris: string[];
  };
}

export interface ShowOpenFileDialogResponse extends ExtensionResponse {
  type: "showOpenFileDialogResponse";
  params: {
    relativePaths: string[];
  };
}

export interface ShowOpenFolderDialogResponse extends ExtensionResponse {
  type: "showOpenFolderDialogResponse";
  params: {
    relativePaths: string[];
  };
}

export interface OpenFilesResponse extends ExtensionResponse {
  type: "openFilesResponse";
  params: {
    contents: (string | null)[];
  };
}

export type ExtensionToEditorMessage =
  | LoadGraphMessage
  | ExportGraphRequestMessage
  | ShowOpenFileDialogResponse
  | DisposeMessage
  | ToWebviewURIResponse
  | OpenFilesResponse
  | ShowOpenFolderDialogResponse;

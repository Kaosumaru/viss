import type { SocketRef } from "@renderer/graph/emitter";
import type { Position } from "rete-react-plugin";
import type { MenuItem } from "./interface";
import type { EditorAPI } from "@renderer/graph/interface";
import type { Parameters } from "@graph/parameter";

export async function createNode(
  editor: EditorAPI,
  item: MenuItem,
  position: Position,
  socketRef?: SocketRef
) {
  const node = item.nodeType;

  let params: Parameters | undefined;
  if (item.identifierParam) {
    params = {
      _identifier: {
        type: "string",
        value: item.identifierParam,
      },
    };
  }

  const toId = await editor.createNode(
    node,
    "screen",
    position.x,
    position.y,
    params
  );

  if (socketRef && toId) {
    editor.addSuggestedConnection(socketRef.nodeId, toId);
  }
}

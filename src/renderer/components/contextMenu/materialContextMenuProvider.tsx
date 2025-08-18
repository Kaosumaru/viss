import React, { useState, useCallback } from "react";
import { MaterialContextMenu } from "./materialContextMenu";
import { NodeContextMenu } from "./nodeContextMenu";
import { UICompilerNode } from "../../graph/nodes/compilerNode";
import type { FunctionDefinition } from "@glsl/function";
import type { MenuItem } from "./interface";
import type { Uniforms } from "@graph/uniform";

interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  type: "canvas" | "node";
  nodeId?: string;
}

interface MaterialContextMenuProviderProps {
  children: React.ReactNode;
  onNodeCreate?: (node: MenuItem) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeTogglePreview?: (nodeId: string) => void;
  onContextMenuOpen?: (position: { x: number; y: number }) => void;
  getNodeById?: (nodeId: string) => UICompilerNode | undefined;
  customFunctions: FunctionDefinition[];
  uniforms: Uniforms;
}

export const MaterialContextMenuProvider: React.FC<
  MaterialContextMenuProviderProps
> = ({
  children,
  onNodeCreate,
  onNodeDelete,
  onNodeTogglePreview,
  onContextMenuOpen,
  getNodeById,
  customFunctions,
  uniforms,
}) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    visible: false,
    position: { x: 0, y: 0 },
    type: "canvas",
  });

  const showContextMenu = useCallback(
    (event: React.MouseEvent) => {
      // Check if we're clicking on a node
      const target = event.target as Element;
      const nodeElement = target.closest("[data-node-id]");
      const isOnSocket = target.closest(".rete-socket"); // TODO this needs to use diffect selector
      const isOnConnection = target.closest(".rete-connection"); // TODO this needs to use diffect selector

      // Don't show context menu on sockets or connections
      if (isOnSocket || isOnConnection) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const position = { x: event.clientX, y: event.clientY };

      if (nodeElement) {
        // Right-clicked on a node - show node context menu
        // Try to get node ID from various attributes
        const nodeId =
          nodeElement.getAttribute("data-node-id") ||
          nodeElement.getAttribute("data-testid") ||
          nodeElement.id;

        if (nodeId) {
          setContextMenuState({
            visible: true,
            position,
            type: "node",
            nodeId,
          });
        }
      } else {
        // Right-clicked on canvas - show canvas context menu
        setContextMenuState({
          visible: true,
          position,
          type: "canvas",
        });
        onContextMenuOpen?.(position);
      }
    },
    [onContextMenuOpen]
  );

  const hideContextMenu = useCallback(() => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleNodeCreate = useCallback(
    (item: MenuItem) => {
      if (onNodeCreate) {
        onNodeCreate(item);
      }
      hideContextMenu();
    },
    [onNodeCreate, hideContextMenu]
  );

  const handleNodeDelete = useCallback(
    (node: UICompilerNode) => {
      if (onNodeDelete) {
        onNodeDelete(node.id);
      }
      hideContextMenu();
    },
    [onNodeDelete, hideContextMenu]
  );

  const handleNodeTogglePreview = useCallback(
    (node: UICompilerNode) => {
      if (onNodeTogglePreview) {
        onNodeTogglePreview(node.id);
      }
      hideContextMenu();
    },
    [onNodeTogglePreview, hideContextMenu]
  );

  // Get the actual node for the context menu
  const selectedNode =
    contextMenuState.nodeId && getNodeById
      ? getNodeById(contextMenuState.nodeId)
      : undefined;

  return (
    <div
      onContextMenu={showContextMenu}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {children}
      {contextMenuState.visible && contextMenuState.type === "canvas" && (
        <MaterialContextMenu
          position={contextMenuState.position}
          onClose={hideContextMenu}
          onNodeCreate={handleNodeCreate}
          customFunctions={customFunctions}
          uniforms={uniforms}
        />
      )}
      {contextMenuState.visible &&
        contextMenuState.type === "node" &&
        selectedNode && (
          <NodeContextMenu
            position={contextMenuState.position}
            node={selectedNode}
            onClose={hideContextMenu}
            onDeleteNode={handleNodeDelete}
            onTogglePreview={handleNodeTogglePreview}
          />
        )}
    </div>
  );
};

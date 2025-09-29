import React, { useState, useCallback, useRef } from "react";
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

interface MouseDownState {
  isRightMouseDown: boolean;
  startPosition: { x: number; y: number };
  target: Element | null;
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

  const mouseDownState = useRef<MouseDownState>({
    isRightMouseDown: false,
    startPosition: { x: 0, y: 0 },
    target: null,
  });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Only handle right mouse button
    if (event.button === 2) {
      mouseDownState.current = {
        isRightMouseDown: true,
        startPosition: { x: event.clientX, y: event.clientY },
        target: event.target as Element,
      };
    }
  }, []);

  const handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      // Only handle right mouse button
      if (event.button === 2 && mouseDownState.current.isRightMouseDown) {
        const endPosition = { x: event.clientX, y: event.clientY };
        const startPosition = mouseDownState.current.startPosition;

        // Calculate distance moved
        const deltaX = endPosition.x - startPosition.x;
        const deltaY = endPosition.y - startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only show context menu if movement is less than 5 pixels
        if (distance < 5) {
          const target = mouseDownState.current.target;
          const nodeElement = target?.closest("[data-node-id]");
          const isOnSocket = target?.closest(".rete-socket");
          const isOnConnection = target?.closest(".rete-connection");

          // Don't show context menu on sockets or connections
          if (!isOnSocket && !isOnConnection) {
            event.preventDefault();
            event.stopPropagation();

            if (nodeElement) {
              // Right-clicked on a node - show node context menu
              const nodeId =
                nodeElement.getAttribute("data-node-id") ||
                nodeElement.getAttribute("data-testid") ||
                nodeElement.id;

              if (nodeId) {
                setContextMenuState({
                  visible: true,
                  position: endPosition,
                  type: "node",
                  nodeId,
                });
              }
            } else {
              // Right-clicked on canvas - show canvas context menu
              setContextMenuState({
                visible: true,
                position: endPosition,
                type: "canvas",
              });
              onContextMenuOpen?.(endPosition);
            }
          }
        }

        // Reset mouse down state
        mouseDownState.current.isRightMouseDown = false;
      }
    },
    [onContextMenuOpen]
  );

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    // Prevent the default context menu from showing
    event.preventDefault();
  }, []);

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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
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

import React, { useState, useCallback, useRef, useEffect } from "react";
import { CreateContextMenu } from "./create/createContextMenu";
import { NodeContextMenu } from "./node/nodeContextMenu";
import { UICompilerNode } from "../../graph/nodes/compilerNode";
import type { FunctionDefinition } from "@glsl/function";
import type { Uniforms } from "@graph/uniform";
import { useEmitter, type SocketRef } from "@renderer/graph/emitter";

interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  type: "canvas" | "node";
  nodeId?: string;
  socketRef?: SocketRef;
}

interface MouseDownState {
  isRightMouseDown: boolean;
  startPosition: { x: number; y: number };
  target: Element | null;
}

interface ContextMenuProviderProps {
  children: React.ReactNode;
  getNodeById?: (nodeId: string) => UICompilerNode | undefined;
  customFunctions: FunctionDefinition[];
  uniforms: Uniforms;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children,
  getNodeById,
  customFunctions,
  uniforms,
}) => {
  const resolveRef = useRef<(v: unknown) => void>(null);
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

  useEmitter("connectionDroppedOnEmpty", async (event) => {
    const position = event.position;
    setContextMenuState({
      visible: true,
      position,
      type: "canvas",
      socketRef: event.from,
    });
    const openPromise = new Promise((resolve) => {
      resolveRef.current = resolve;
    });

    await openPromise;
  });

  useEffect(() => {
    if (!contextMenuState.visible && resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, [contextMenuState.visible]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Only handle right mouse button
    if (event.button !== 2) {
      return;
    }
    mouseDownState.current = {
      isRightMouseDown: true,
      startPosition: { x: event.clientX, y: event.clientY },
      target: event.target as Element,
    };
  }, []);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    // Only handle right mouse button
    if (event.button !== 2 || !mouseDownState.current.isRightMouseDown) {
      return;
    }
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
        }
      }
    }

    // Reset mouse down state
    mouseDownState.current.isRightMouseDown = false;
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    // Prevent the default context menu from showing
    event.preventDefault();
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));
  }, []);

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
        <CreateContextMenu
          position={contextMenuState.position}
          onClose={hideContextMenu}
          socketRef={contextMenuState.socketRef}
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
          />
        )}
    </div>
  );
};

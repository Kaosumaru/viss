import React, { useState, useCallback } from "react";
import { MaterialContextMenu } from "./materialContextMenu";
import { UICompilerNode } from "../../graph/nodes/compilerNode";
import type { NodeType } from "@compiler/nodes/allNodes";

interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
}

interface MaterialContextMenuProviderProps {
  children: React.ReactNode;
  onNodeCreate?: (node: UICompilerNode) => void;
  onContextMenuOpen?: (position: { x: number; y: number }) => void;
}

export const MaterialContextMenuProvider: React.FC<
  MaterialContextMenuProviderProps
> = ({ children, onNodeCreate, onContextMenuOpen }) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    visible: false,
    position: { x: 0, y: 0 },
  });

  const showContextMenu = useCallback(
    (event: React.MouseEvent) => {
      // Check if we're clicking on the canvas background or editor area (not on nodes)
      const target = event.target as Element;
      const isOnNode =
        target.closest(".rete-node") ||
        target.closest(".rete-socket") ||
        target.closest(".rete-connection");

      // Only show context menu if we're NOT clicking on a node, socket, or connection
      if (!isOnNode) {
        event.preventDefault();
        event.stopPropagation();
        const position = { x: event.clientX, y: event.clientY };
        setContextMenuState({
          visible: true,
          position,
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
    (nodeType: NodeType) => {
      const node = new UICompilerNode(nodeType);
      if (onNodeCreate) {
        onNodeCreate(node);
      }
      hideContextMenu();
    },
    [onNodeCreate, hideContextMenu]
  );

  return (
    <div
      onContextMenu={showContextMenu}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {children}
      {contextMenuState.visible && (
        <MaterialContextMenu
          position={contextMenuState.position}
          onClose={hideContextMenu}
          onNodeCreate={handleNodeCreate}
        />
      )}
    </div>
  );
};

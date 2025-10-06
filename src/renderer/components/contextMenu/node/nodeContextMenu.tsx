/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-constant-binary-expression */
import React, { useRef, useEffect, useContext } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AutoFixHigh as ArrangeIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type { UICompilerNode } from "../../../graph/nodes/compilerNode";
import { EditorContext } from "@renderer/context/EditorContext";

// Styled components for Unreal Engine-like appearance
const ContextMenuContainer = styled(Paper)(() => ({
  minWidth: 180,
  maxWidth: 250,
  overflow: "hidden",
  backgroundColor: "#2d2d30",
  color: "#ffffff",
  border: "1px solid #464647",
  borderRadius: 4,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
}));

const MenuList = styled(List)(() => ({
  padding: 0,
}));

const MenuItem = styled(ListItem)(() => ({
  padding: "8px 16px",
  cursor: "pointer",
  borderLeft: "2px solid transparent",
  "&:hover": {
    backgroundColor: "#414142",
    borderLeftColor: "#007acc",
  },
}));

const MenuIcon = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginRight: "12px",
  color: "#cccccc", // Default color
  "&.delete-icon": {
    color: "#ff6b6b", // Red color for delete action
  },
  "&.preview-icon": {
    color: "#007acc", // Blue color for preview action
  },
  "&.arrange-icon": {
    color: "#4CAF50", // Green color for arrange action
  },
  "&.group-icon": {
    color: "#9C27B0", // Purple color for group action
  },
}));

interface NodeContextMenuProps {
  position: { x: number; y: number };
  node: UICompilerNode;
  onClose: () => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  position,
  node,
  onClose,
}) => {
  const editor = useContext(EditorContext).editor;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle click outside to close menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Handle escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleDeleteClick = () => {
    if (!editor) return;
    if (!editor.isNodeSelected(node.id)) {
      void editor.deleteNode(node.id);
    } else {
      const selectedNodes = editor.getSelectedNodes();
      void editor.deleteNodes(selectedNodes);
    }
    onClose();
  };

  const handleTogglePreviewClick = () => {
    editor?.getNode(node.id)?.togglePreview();
    onClose();
  };

  const handleArrangeClick = () => {
    if (!editor) return;
    const selectedNodes = editor.getSelectedNodes();
    void editor.arrangeNodes(selectedNodes);
    onClose();
  };

  const handleGroupClick = () => {
    if (!editor) return;
    const selectedNodes = editor.getSelectedNodes();
    editor.group(selectedNodes);
    onClose();
  };

  // Get selected nodes info
  const selectedNodes = editor?.getSelectedNodes() || [];
  const hasMultipleSelected = selectedNodes.length > 1;

  return (
    <ContextMenuContainer
      ref={menuRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      <MenuList>
        <MenuItem onClick={handleTogglePreviewClick}>
          <MenuIcon className="preview-icon">
            {node.showPreview ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </MenuIcon>
          <ListItemText
            primary={
              <Typography variant="body2" color="#ffffff">
                {node.showPreview ? "Hide Preview" : "Show Preview"}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="#cccccc">
                {node.showPreview ? "Hide node preview" : "Show node preview"}
              </Typography>
            }
          />
        </MenuItem>
        {hasMultipleSelected && (
          <MenuItem onClick={handleArrangeClick}>
            <MenuIcon className="arrange-icon">
              <ArrangeIcon fontSize="small" />
            </MenuIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="#ffffff">
                  Arrange
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="#cccccc">
                  Auto-arrange selected nodes
                </Typography>
              }
            />
          </MenuItem>
        )}

        {false && (
          <MenuItem onClick={handleGroupClick}>
            <MenuIcon className="group-icon">
              <GroupIcon fontSize="small" />
            </MenuIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="#ffffff">
                  Group
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="#cccccc">
                  Group selected nodes
                </Typography>
              }
            />
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick}>
          <MenuIcon className="delete-icon">
            <DeleteIcon fontSize="small" />
          </MenuIcon>
          <ListItemText
            primary={
              <Typography variant="body2" color="#ffffff">
                Delete
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="#cccccc">
                Remove this node
              </Typography>
            }
          />
        </MenuItem>
      </MenuList>
    </ContextMenuContainer>
  );
};

import React, { useRef, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import { Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type { UICompilerNode } from "../../graph/nodes/compilerNode";

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
}));

interface NodeContextMenuProps {
  position: { x: number; y: number };
  node: UICompilerNode;
  onClose: () => void;
  onDeleteNode: (node: UICompilerNode) => void;
  onTogglePreview: (node: UICompilerNode) => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  position,
  node,
  onClose,
  onDeleteNode,
  onTogglePreview,
}) => {
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
    onDeleteNode(node);
    onClose();
  };

  const handleTogglePreviewClick = () => {
    onTogglePreview(node);
    onClose();
  };

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

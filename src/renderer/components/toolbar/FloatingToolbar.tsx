import { Paper, IconButton, Tooltip } from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ViewSidebar,
  ViewSidebarOutlined,
} from "@mui/icons-material";
import styled from "styled-components";

const ToolbarContainer = styled(Paper)`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  gap: 4px;
  padding: 4px;
  background-color: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ToolbarIconButton = styled(IconButton)`
  color: white !important;
  padding: 8px !important;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
`;

export interface FloatingToolbarProps {
  isPropertyViewVisible: boolean;
  onTogglePropertyView: () => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export function FloatingToolbar({
  isPropertyViewVisible,
  onTogglePropertyView,
  isSidebarVisible,
  onToggleSidebar,
}: FloatingToolbarProps) {
  return (
    <ToolbarContainer elevation={3}>
      <Tooltip
        title={
          isPropertyViewVisible ? "Hide Property View" : "Show Property View"
        }
      >
        <ToolbarIconButton onClick={onTogglePropertyView}>
          {isPropertyViewVisible ? <Visibility /> : <VisibilityOff />}
        </ToolbarIconButton>
      </Tooltip>
      <Tooltip title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}>
        <ToolbarIconButton onClick={onToggleSidebar}>
          {isSidebarVisible ? <ViewSidebar /> : <ViewSidebarOutlined />}
        </ToolbarIconButton>
      </Tooltip>
    </ToolbarContainer>
  );
}

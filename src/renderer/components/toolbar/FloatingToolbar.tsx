import { Paper, IconButton, Tooltip } from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ViewSidebar,
  ViewSidebarOutlined,
  CenterFocusStrong,
} from "@mui/icons-material";
import styled from "styled-components";
import { useContext } from "react";
import { EditorContext } from "@renderer/context/EditorContext";

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
  isPreviewViewVisible: boolean;
  onTogglePreviewView: () => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export function FloatingToolbar({
  isPreviewViewVisible,
  onTogglePreviewView,
  isSidebarVisible,
  onToggleSidebar,
}: FloatingToolbarProps) {
  const editorData = useContext(EditorContext).editor;

  const handleCenterView = () => {
    if (!editorData) {
      console.warn("No editor available");
      return;
    }
    void editorData.centerView();
  };

  return (
    <ToolbarContainer elevation={3}>
      <Tooltip
        title={
          isPreviewViewVisible ? "Hide Preview View" : "Show Preview View"
        }
      >
        <ToolbarIconButton onClick={onTogglePreviewView}>
          {isPreviewViewVisible ? <Visibility /> : <VisibilityOff />}
        </ToolbarIconButton>
      </Tooltip>
      <Tooltip title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}>
        <ToolbarIconButton onClick={onToggleSidebar}>
          {isSidebarVisible ? <ViewSidebar /> : <ViewSidebarOutlined />}
        </ToolbarIconButton>
      </Tooltip>
      <Tooltip title="Center View">
        <ToolbarIconButton onClick={handleCenterView} disabled={!editorData}>
          <CenterFocusStrong />
        </ToolbarIconButton>
      </Tooltip>
    </ToolbarContainer>
  );
}

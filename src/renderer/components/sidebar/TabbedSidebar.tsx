import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UniformsPanel } from "../uniforms/UniformsPanel";
import { IncludesPanel } from "../includes";

const StyledTabs = styled(Tabs)({
  backgroundColor: "#222",
  "& .MuiTabs-indicator": {
    backgroundColor: "#1976d2",
  },
});

const StyledTab = styled(Tab)({
  color: "#aaa",
  fontSize: "0.875rem",
  minHeight: 48,
  "&.Mui-selected": {
    color: "#fff",
  },
  "&:hover": {
    color: "#fff",
  },
});

const TabPanel = styled(Box)({
  height: "calc(100% - 48px)", // Subtract tab height
  overflow: "hidden",
});

export const TabbedSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <StyledTab label="Uniforms" />
        <StyledTab label="Includes" />
      </StyledTabs>
      
      <TabPanel>
        {activeTab === 0 && <UniformsPanel />}
        {activeTab === 1 && <IncludesPanel />}
      </TabPanel>
    </Box>
  );
};
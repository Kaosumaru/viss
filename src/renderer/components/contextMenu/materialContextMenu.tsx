import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  Box,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type { MenuCategory, MenuItem } from "./interface";
import { getMenuElements } from "./menuElements";
import type { FunctionDefinition } from "@glsl/function";

// Styled components for Unreal Engine-like appearance
const ContextMenuContainer = styled(Paper)(() => ({
  minWidth: 300,
  maxWidth: 400,
  maxHeight: 500,
  overflow: "hidden",
  backgroundColor: "#2d2d30",
  color: "#ffffff",
  border: "1px solid #464647",
  borderRadius: 4,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
}));

const SearchContainer = styled(Box)(() => ({
  padding: "8px 8px",
  borderBottom: "1px solid #464647",
  backgroundColor: "#383838",
}));

const StyledTextField = styled(TextField)(() => ({
  "& .MuiInputBase-root": {
    color: "#ffffff",
    fontSize: "14px",
    backgroundColor: "#1e1e1e",
    "& fieldset": {
      border: "1px solid #464647",
    },
    "&:hover fieldset": {
      borderColor: "#007acc",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#007acc",
    },
  },
  "& .MuiInputAdornment-root": {
    color: "#cccccc",
  },
}));

const CategoryList = styled(List)(() => ({
  padding: 0,
  maxHeight: 400,
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#1e1e1e",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#464647",
    borderRadius: "4px",
  },
}));

const CategoryHeader = styled(ListItem)(() => ({
  backgroundColor: "#323233",
  borderBottom: "1px solid #464647",
  padding: "2px 8px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#404041",
  },
}));

const NodeItem = styled(ListItem)(() => ({
  padding: "0px 10px",
  cursor: "pointer",
  borderLeft: "2px solid transparent",
  "&:hover": {
    backgroundColor: "#414142",
    borderLeftColor: "#007acc",
  },
}));

const CategoryIcon = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginRight: "8px",
  color: "#cccccc",
}));

interface MaterialContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onNodeCreate: (item: MenuItem) => void;
  customFunctions: FunctionDefinition[];
}

export const MaterialContextMenu: React.FC<MaterialContextMenuProps> = ({
  position,
  onClose,
  onNodeCreate,
  customFunctions,
}) => {
  const menuElements = getMenuElements(customFunctions);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(menuElements.map((cat) => cat.name))
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input when menu opens
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

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

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleNodeCreate = (item: MenuItem) => {
    onNodeCreate(item);
    onClose();
  };

  const filterItems = (items: MenuCategory["items"]) => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return menuElements;
    return menuElements
      .map((category) => ({
        ...category,
        items: filterItems(category.items),
      }))
      .filter((category) => category.items.length > 0);
  };

  const filteredCategories = getFilteredCategories();

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
      <SearchContainer>
        <StyledTextField
          inputRef={searchInputRef}
          placeholder="Search nodes..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </SearchContainer>

      <CategoryList>
        {filteredCategories.map((category) => (
          <Box key={category.name}>
            <CategoryHeader onClick={() => toggleCategory(category.name)}>
              <CategoryIcon>{category.icon}</CategoryIcon>
              <ListItemText
                primary={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {category.name}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Chip
                        label={category.items.length}
                        size="small"
                        sx={{
                          backgroundColor: "#464647",
                          color: "#cccccc",
                          fontSize: "11px",
                          height: "20px",
                          marginRight: "8px",
                        }}
                      />
                      {expandedCategories.has(category.name) ? (
                        <ExpandLess fontSize="small" />
                      ) : (
                        <ExpandMore fontSize="small" />
                      )}
                    </Box>
                  </Box>
                }
              />
            </CategoryHeader>
            <Collapse in={expandedCategories.has(category.name)}>
              {filterItems(category.items).map((item) => (
                <NodeItem
                  key={item.name}
                  onClick={() => handleNodeCreate(item)}
                >
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="body2" color="#ffffff">
                          {item.name}{" "}
                          <Typography variant="caption" color="#cccccc">
                            {item.description}
                          </Typography>
                        </Typography>
                      </>
                    }
                  />
                </NodeItem>
              ))}
            </Collapse>
          </Box>
        ))}
        {filteredCategories.length === 0 && (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="#888888">
              No nodes found matching "{searchTerm}"
            </Typography>
          </Box>
        )}
      </CategoryList>
    </ContextMenuContainer>
  );
};

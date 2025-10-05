import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Paper, List, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { MenuItem } from "./interface";
import type { FunctionDefinition } from "@glsl/function";
import type { Uniforms } from "@graph/uniform";
import type { SocketRef } from "@renderer/graph/emitter";
import { EditorContext } from "@renderer/context/EditorContext";
import { createNode } from "./createNode";
import { SearchBar, CategoryComponent } from "./components";
import type { Type } from "@glsl/types/types";
import { getFilteredCategories } from "./filterItem";
import { getMenuElements } from "./menuElements";

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

interface CreateContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  customFunctions: FunctionDefinition[];
  uniforms: Uniforms;
  inputType?: Type;
  socketRef?: SocketRef;
}

export const CreateContextMenu: React.FC<CreateContextMenuProps> = ({
  position,
  onClose,
  customFunctions,
  uniforms,
  inputType,
  socketRef,
}) => {
  const editor = useContext(EditorContext).editor;
  const menuElements = useMemo(
    () => getMenuElements(customFunctions, uniforms),
    [customFunctions, uniforms]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(menuElements.map((cat) => cat.name))
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleNodeCreate = useCallback(
    (item: MenuItem) => {
      if (!editor) return;
      void createNode(editor, item, position, socketRef);
      onClose();
    },
    [editor, onClose, position, socketRef]
  );

  const filteredCategories = useMemo(
    () => getFilteredCategories(menuElements, searchTerm, inputType),
    [menuElements, searchTerm, inputType]
  );

  // Get all visible items in a flat array for keyboard navigation
  const getAllVisibleItems = () => {
    const items: MenuItem[] = [];
    filteredCategories.forEach((category) => {
      if (expandedCategories.has(category.name)) {
        items.push(...category.items);
      }
    });
    return items;
  };

  const allVisibleItems = getAllVisibleItems();

  // Reset selected index when search term changes or categories expand/collapse
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm, expandedCategories]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && selectedIndex >= 0) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

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

    // Handle escape key and arrow navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          const maxIndex = allVisibleItems.length - 1;
          return prev < maxIndex ? prev + 1 : prev;
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allVisibleItems.length) {
          const selectedItem = allVisibleItems[selectedIndex];
          if (selectedItem) {
            handleNodeCreate(selectedItem);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, allVisibleItems, handleNodeCreate, selectedIndex]);

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
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setSelectedIndex(-1); // Reset selection when search changes
        }}
        inputRef={searchInputRef}
      />

      <CategoryList>
        {(() => {
          let globalItemIndex = 0;
          return filteredCategories.map((category) => {
            const itemCount = category.items.length;
            const categoryComponent = (
              <CategoryComponent
                key={category.name}
                category={category}
                isExpanded={expandedCategories.has(category.name)}
                onToggle={() => {
                  toggleCategory(category.name);
                }}
                onItemCreate={handleNodeCreate}
                selectedIndex={selectedIndex}
                globalItemIndex={globalItemIndex}
                onItemMouseEnter={setSelectedIndex}
                selectedItemRef={selectedItemRef}
              />
            );
            globalItemIndex += itemCount;
            return categoryComponent;
          });
        })()}
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

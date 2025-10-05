import React from "react";
import {
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type { MenuCategory, MenuItem } from "../interface";
import { MenuItemComponent } from "./MenuItemComponent";

const CategoryHeader = styled(ListItem)(() => ({
  backgroundColor: "#323233",
  borderBottom: "1px solid #464647",
  padding: "2px 8px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#404041",
  },
}));

const CategoryIcon = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  marginRight: "8px",
  color: "#cccccc",
}));

interface CategoryComponentProps {
  category: MenuCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onItemCreate: (item: MenuItem) => void;
  selectedIndex: number;
  globalItemIndex: number;
  onItemMouseEnter: (index: number) => void;
  selectedItemRef?: React.RefObject<HTMLLIElement | null>;
}

export const CategoryComponent: React.FC<CategoryComponentProps> = ({
  category,
  isExpanded,
  onToggle,
  onItemCreate,
  selectedIndex,
  globalItemIndex,
  onItemMouseEnter,
  selectedItemRef,
}) => {
  return (
    <Box key={category.name}>
      <CategoryHeader onClick={onToggle}>
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
                {isExpanded ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </Box>
            </Box>
          }
        />
      </CategoryHeader>
      <Collapse in={isExpanded}>
        {isExpanded &&
          category.items.map((item, index) => {
            const currentItemIndex = globalItemIndex + index;
            const isSelected = selectedIndex === currentItemIndex;
            return (
              <MenuItemComponent
                key={item.name}
                item={item}
                isSelected={isSelected}
                onClick={() => {
                  onItemCreate(item);
                }}
                onMouseEnter={() => {
                  onItemMouseEnter(currentItemIndex);
                }}
                itemRef={isSelected ? selectedItemRef : undefined}
              />
            );
          })}
      </Collapse>
    </Box>
  );
};

import React from "react";
import {
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { MenuItem } from "../interface";

const NodeItem = styled(ListItem)<{ $isSelected?: boolean }>(
  ({ $isSelected }) => ({
    padding: "0px 10px",
    cursor: "pointer",
    borderLeft: "2px solid transparent",
    backgroundColor: $isSelected ? "#414142" : "transparent",
    "&:hover": {
      backgroundColor: "#414142",
      borderLeftColor: "#007acc",
    },
    ...($isSelected && {
      borderLeftColor: "#007acc",
    }),
  })
);

interface MenuItemComponentProps {
  item: MenuItem;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  itemRef?: React.RefObject<HTMLLIElement | null>;
}

export const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  isSelected,
  onClick,
  onMouseEnter,
  itemRef,
}) => {
  return (
    <NodeItem
      key={item.name}
      ref={itemRef}
      $isSelected={isSelected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
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
  );
};
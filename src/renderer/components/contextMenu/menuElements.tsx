import {
  nodeCategories,
  type NodeCategory,
  type NodeCategoryId,
  type NodeType,
} from "@compiler/nodes/allNodes";
import type { MenuCategory, MenuItem } from "./interface";
import {
  Functions as FunctionsIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import type { FunctionDefinition } from "@glsl/function";

export function getMenuElements(customFunctions: FunctionDefinition[]) {
  return [
    ...menuElements,
    {
      name: "Custom Functions",
      icon: <FunctionsIcon fontSize="small" />,
      items: customFunctions.map(functionToItem),
    },
  ];
}

function functionToItem(fn: FunctionDefinition): MenuItem {
  return {
    name: fn.name,
    nodeType: "glslFunction",
    nameParam: fn.name,
    description: "No description available",
  };
}

const menuElements: MenuCategory[] = nodeCategories.map(createMenuCategory);

function createMenuCategory(category: NodeCategory): MenuCategory {
  return {
    name: category.name,
    icon: getIconForCategory(category.id as NodeCategoryId),
    items: Object.entries(category.nodes).map(([name, node]) => ({
      name: node.getLabel(),
      nodeType: name as NodeType,
      description: node.getDescription(),
    })),
  };
}

function getIconForCategory(categoryId: NodeCategoryId): React.ReactNode {
  switch (categoryId) {
    case "literals":
      return <CalculateIcon fontSize="small" />;
    case "operators":
      return <FunctionsIcon fontSize="small" />;
    case "uniforms":
      return <SettingsIcon fontSize="small" />;
    case "functions":
      return <FunctionsIcon fontSize="small" />;
    case "vectors":
      return <TimelineIcon fontSize="small" />;
    case "utils":
      return <SettingsIcon fontSize="small" />;
    case "output":
      return <VisibilityIcon fontSize="small" />;
  }
}

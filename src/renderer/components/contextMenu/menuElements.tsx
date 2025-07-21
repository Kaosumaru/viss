import { nodeCategories, type NodeCategory, type NodeCategoryId, type NodeType } from "@compiler/nodes/allNodes";
import type { MenuCategory } from "./interface";
import {
  Functions as FunctionsIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";


export const menuElements: MenuCategory[] = nodeCategories.map(createMenuCategory);


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
    case 'literals':
      return <CalculateIcon fontSize="small" />;
    case 'operators':
      return <FunctionsIcon fontSize="small" />;
    case 'uniforms':
      return <SettingsIcon fontSize="small" />;
    case 'functions':
      return <FunctionsIcon fontSize="small" />;
    case 'vectors':
      return <TimelineIcon fontSize="small" />;
    case 'utils':
      return <SettingsIcon fontSize="small" />;
    case 'output':
      return <VisibilityIcon fontSize="small" />;
  }
}

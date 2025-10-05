import type { NodeType } from "@compiler/nodes/allNodes";

export interface MenuItem {
  name: string;
  nodeType: NodeType;
  identifierParam?: string;
  description?: string;
}

export interface MenuCategory {
  name: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

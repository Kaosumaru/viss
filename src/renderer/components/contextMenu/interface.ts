import type { NodeType } from "@compiler/nodes/allNodes";

export interface MenuCategory {
  name: string;
  icon: React.ReactNode;
  items: {
    name: string;
    nodeType: NodeType;
    description?: string;
  }[];
}

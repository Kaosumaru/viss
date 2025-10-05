import type { NodeType } from "@compiler/nodes/allNodes";
import type { Type } from "@glsl/types/types";

export interface MenuItem {
  name: string;
  nodeType: NodeType;
  identifierParam?: string;
  description?: string;
  filterBy: (inputType?: Type) => boolean;
}

export interface MenuCategory {
  name: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

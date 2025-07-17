import type { MenuCategory } from "./interface";
import {
  Functions as FunctionsIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

export const menuElements: MenuCategory[] = [
  {
    name: "Literals",
    icon: <CalculateIcon fontSize="small" />,
    items: [
      {
        name: "Float",
        nodeType: "float",
        description: "Single floating point value",
      },
    ],
  },
  {
    name: "Operators",
    icon: <FunctionsIcon fontSize="small" />,
    items: [
      {
        name: "Add",
        nodeType: "add",
        description: "Addition operation",
      },
      {
        name: "Subtract",
        nodeType: "substract",
        description: "Subtraction operation",
      },
      {
        name: "Divide",
        nodeType: "divide",
        description: "Division operation",
      },
    ],
  },
  {
    name: "Uniforms",
    icon: <SettingsIcon fontSize="small" />,
    items: [
      {
        name: "Time",
        nodeType: "time",
        description: "Global time uniform",
      },
      {
        name: "FragCoord",
        nodeType: "fragCoord",
        description: "Fragment coordinates",
      },
    ],
  },
  {
    name: "Functions",
    icon: <FunctionsIcon fontSize="small" />,
    items: [
      {
        name: "Sin",
        nodeType: "sin",
        description: "Sine function",
      },
      {
        name: "Abs",
        nodeType: "abs",
        description: "Absolute value function",
      },
    ],
  },
  {
    name: "Vectors",
    icon: <TimelineIcon fontSize="small" />,
    items: [
      {
        name: "Compose Vec4",
        nodeType: "composeVector4",
        description: "Create a 4-component vector",
      },
      {
        name: "Get X",
        nodeType: "getX",
        description: "Extract X component",
      },
      {
        name: "Get Y",
        nodeType: "getY",
        description: "Extract Y component",
      },
    ],
  },
  {
    name: "Output",
    icon: <VisibilityIcon fontSize="small" />,
    items: [
      {
        name: "Preview",
        nodeType: "preview",
        description: "Preview the result",
      },
    ],
  },
];

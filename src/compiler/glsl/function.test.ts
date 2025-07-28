import { expect, test } from "vitest";
import { listFunctions } from "./function";
import { scalar } from "./types/types";

test("Parses simple function", () => {
  const list = listFunctions(
    `
     #pragma editor: export
     float add(float a, float b) {
       return a + b;
     }
    `
  );
  expect(list).toEqual([
    {
      name: "add",
      parameters: [
        { name: "a", mode: "in", type: scalar("float") },
        { name: "b", mode: "in", type: scalar("float") },
      ],
      returnType: scalar("float"),
      pragmas: new Set(["export"]),
    },
  ]);
});

test("Parses pragmas", () => {
  const list = listFunctions(
    `
     #pragma editor: export, preview
     float add(float a, float b) {
       return a + b;
     }
    `
  );
  expect(list).toEqual([
    {
      name: "add",
      parameters: [
        { name: "a", mode: "in", type: scalar("float") },
        { name: "b", mode: "in", type: scalar("float") },
      ],
      returnType: scalar("float"),
      pragmas: new Set(["export", "preview"]),
    },
  ]);
});

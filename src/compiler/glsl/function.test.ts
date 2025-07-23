import { expect, test } from "vitest";
import { listFunctions } from "./function";
import { scalar } from "./types";

test("Parses simple function", () => {
  const list = listFunctions(
    `
     float add(float a, float b) {
       return a + b;
     }
    `
  );
  expect(list).toEqual([
    {
      name: "add",
      parameters: [
        { name: "a", type: scalar("float") },
        { name: "b", type: scalar("float") },
      ],
      returnType: scalar("float"),
    },
  ]);
});

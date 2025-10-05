import { expect, test } from "vitest";
import { typeMatchesAnyNodeInput } from "./allNodes";
import { scalar, vector } from "@glsl/types/types";

test("typeMatchesAnyNodeInput - add node accepts float scalar", () => {
  const result = typeMatchesAnyNodeInput("add", scalar("float"));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - add node accepts vector", () => {
  const result = typeMatchesAnyNodeInput("add", vector("float", 2));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - sqrt accepts float scalar", () => {
  const result = typeMatchesAnyNodeInput("sqrt", scalar("float"));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - sqrt accepts vector", () => {
  const result = typeMatchesAnyNodeInput("sqrt", vector("float", 3));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - float literal has no inputs", () => {
  const result = typeMatchesAnyNodeInput("float", scalar("float"));
  expect(result).toBe(false);
});

test("typeMatchesAnyNodeInput - output node accepts float", () => {
  const result = typeMatchesAnyNodeInput("output", scalar("float"));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - output node accepts vec4", () => {
  const result = typeMatchesAnyNodeInput("output", vector("float", 4));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - decomposeVector accepts vector", () => {
  const result = typeMatchesAnyNodeInput("decomposeVector", vector("float", 3));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - decomposeVector rejects scalar", () => {
  const result = typeMatchesAnyNodeInput("decomposeVector", scalar("float"));
  expect(result).toBe(false);
});

test("typeMatchesAnyNodeInput - add node accepts int scalar (variant type)", () => {
  const result = typeMatchesAnyNodeInput("add", scalar("int"));
  expect(result).toBe(true);
});

test("typeMatchesAnyNodeInput - add node accepts bool vector (variant type)", () => {
  const result = typeMatchesAnyNodeInput("add", vector("bool", 2));
  expect(result).toBe(true);
});

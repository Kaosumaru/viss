import type { NodeInfo } from "@compiler/nodes/compilerNode";
import type { Connection } from "./connection";
import type { Node } from "./node";
import type { Uniforms } from "./uniform";
import type { Group } from "./group";

export interface Graph {
  version: number;
  includes: FilePath[];
  uniforms: Uniforms;
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  // comments?: Comment[];
}

export function arePathsEqual(a: FilePath, b: FilePath): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return a.path === b.path && a.kind === b.kind;
}

export function pathToUUID(path: FilePath): string {
  return `${path.kind}::${path.path}`;
}

export interface FilePath {
  path: string;
  kind: "workspace";
}

export interface IncludedFiles {
  includes: GLSLInclude[];
}

export interface GLSLInclude {
  name: string;
  path: FilePath;
  content: string;
}

export interface AddedNodeInfo {
  node: Node;
  instanceInfo: NodeInfo;
}

export interface GraphDiff {
  addedNodes?: AddedNodeInfo[];
  removedNodes?: Node[];
  translatedNodes?: Set<string>;
  nodesWithModifiedProperties?: Node[];

  addedConnections?: Connection[];
  removedConnections?: Connection[];

  addedGroups?: Group[];
  removedGroups?: Group[];
  updatedGroups?: Group[];

  invalidatedNodeIds?: Set<string>;
  updatedUniforms?: Uniforms;
  updatedIncludes?: string[];

  warnings?: string[];
}

export function mergeGraphDiffs(diffs: GraphDiff[]): GraphDiff {
  return diffs.reduce<GraphDiff>((acc, diff) => {
    acc.addedNodes = mergeLists(acc.addedNodes, diff.addedNodes);
    acc.removedNodes = mergeLists(acc.removedNodes, diff.removedNodes);

    acc.addedConnections = mergeLists(
      acc.addedConnections,
      diff.addedConnections
    );
    acc.removedConnections = mergeLists(
      acc.removedConnections,
      diff.removedConnections
    );

    acc.addedGroups = mergeLists(acc.addedGroups, diff.addedGroups);
    acc.removedGroups = mergeLists(acc.removedGroups, diff.removedGroups);
    acc.updatedGroups = mergeLists(acc.updatedGroups, diff.updatedGroups);

    acc.invalidatedNodeIds = mergeSets(
      acc.invalidatedNodeIds,
      diff.invalidatedNodeIds
    );
    acc.nodesWithModifiedProperties = mergeLists(
      acc.nodesWithModifiedProperties,
      diff.nodesWithModifiedProperties
    );
    acc.updatedUniforms = mergeObjects(
      acc.updatedUniforms,
      diff.updatedUniforms
    );
    acc.updatedIncludes = mergeLists(acc.updatedIncludes, diff.updatedIncludes);
    acc.warnings = mergeLists(acc.warnings, diff.warnings);
    acc.translatedNodes = mergeSets(acc.translatedNodes, diff.translatedNodes);
    return acc;
  }, {});
}

function mergeLists<T>(
  a: T[] | undefined,
  b: T[] | undefined
): T[] | undefined {
  if (a || b) {
    return [...(a || []), ...(b || [])];
  }
  return undefined;
}

function mergeObjects<T>(a: T | undefined, b: T | undefined): T | undefined {
  if (a && b) {
    return {
      ...a,
      ...b,
    };
  }
  if (a) {
    return a;
  }
  if (b) {
    return b;
  }
  return undefined;
}

function mergeSets<T>(
  a: Set<T> | undefined,
  b: Set<T> | undefined
): Set<T> | undefined {
  if (a || b) {
    return new Set([...(a || []), ...(b || [])]);
  }
  return undefined;
}

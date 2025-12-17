import type {
  AccessPatternOptions,
  AstContext,
  NodeScope,
  Symbol,
} from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { $ } from '~/ts-dsl';

import type { TsDsl } from '../base';

const getScope = (node: TsDsl): NodeScope => node.scope ?? 'value';

function traverseStructuralParent(node: TsDsl): boolean {
  if (node.role === 'literal') {
    return false;
  }
  return true;
}

function foldAccessChain<Node extends TsDsl = TsDsl>(
  chain: ReadonlyArray<Node>,
): ReadonlyArray<Node> {
  const folded: Array<Node> = [];

  for (const node of chain) {
    if (folded.length === 0) {
      if (node.role === 'container') {
        folded.push(node);
      }
    } else if (node.role === 'accessor') {
      folded.push(node);
    }
  }

  return folded;
}

function getAccessChain<Node extends TsDsl = TsDsl>(
  node: Node,
): ReadonlyArray<Node> {
  const chain: Array<TsDsl> = [];
  const scope: NodeScope = getScope(node);
  const visited = new Set<TsDsl>();

  let current: TsDsl | undefined = node;
  while (current) {
    if (visited.has(current)) break;
    visited.add(current);

    chain.unshift(current);

    let foundParent = false;
    for (const [parent] of current.structuralParents || []) {
      if (getScope(parent) === scope && traverseStructuralParent(parent)) {
        current = parent;
        foundParent = true;
        break;
      }
    }

    if (!foundParent) break;
  }

  // trim any unreachable nodes before root
  const rootIndex = chain.findIndex((node) => node.root);
  if (rootIndex !== -1) {
    chain.splice(0, rootIndex);
  }

  return foldAccessChain(chain) as ReadonlyArray<Node>;
}

export const astContext: AstContext = {
  getAccess<T = unknown>(
    to: TsDsl | Symbol<TsDsl>,
    options?: AccessPatternOptions,
  ): T {
    const node = isSymbol(to) ? to.node! : to;
    const chain = getAccessChain(node);
    if (chain.length === 0) return node as T;

    let result!: ReturnType<typeof $.expr | typeof $.attr>;

    for (let index = 0; index < chain.length; index++) {
      const currentNode = chain[index]!;

      const transformed = currentNode.accessPattern?.(
        currentNode,
        {
          context: 'runtime',
          ...options,
        },
        {
          chain,
          index,
          isLeaf: index === chain.length - 1,
          isRoot: index === 0,
          length: chain.length,
        },
      ) as typeof result | undefined;

      if (index === 0) {
        result = transformed || $(currentNode.name);
      } else {
        result = result.attr(transformed?.name || currentNode.name);
      }
    }

    return result as T;
  },
};

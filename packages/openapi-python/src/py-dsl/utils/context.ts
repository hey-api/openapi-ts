import type { BindingKind } from '@hey-api/codegen-core';
// import type { BindingKind, NodeScope, Symbol } from '@hey-api/codegen-core';
// import { isSymbol } from '@hey-api/codegen-core';
import type { MaybeFunc } from '@hey-api/types';

import type { DollarPyDsl } from '../../py-dsl';
import type { py } from '../../ts-python';
// import { $, PythonRenderer } from '../../py-dsl';
import type { PyDsl } from '../base';
import type { CallArgs } from '../expr/call';

export type NodeChain = ReadonlyArray<PyDsl>;

export interface AccessOptions {
  /** The access context. */
  context?: 'example';
  /** Enable debug mode. */
  debug?: boolean;
  /** Transform function for each node in the access chain. */
  transform?: (node: PyDsl, index: number, chain: NodeChain) => PyDsl;
}

// export type AccessResult = ReturnType<typeof $.expr | typeof $.attr | typeof $.call | typeof $.new>;

export interface ExampleOptions {
  /** Import kind for the root node. */
  importKind?: BindingKind;
  /** Import name for the root node. */
  importName?: string;
  /** Setup to run before calling the example. */
  importSetup?: MaybeFunc<
    (
      ctx: DollarPyDsl & {
        /** The imported expression. */
        node: PyDsl<py.Expression>;
      },
    ) => PyDsl<py.Expression>
  >;
  /** Module to import from. */
  moduleName?: string;
  /** Example request payload. */
  payload?: MaybeFunc<(ctx: DollarPyDsl) => CallArgs | CallArgs[number]>;
  /** Variable name for setup node. */
  setupName?: string;
}

// function accessChainToNode<T = AccessResult>(accessChain: NodeChain): T {
//   let result!: AccessResult;
//   accessChain.forEach((node, index) => {
//     if (index === 0) {
//       // assume correct node
//       result = node as typeof result;
//     } else {
//       result = result.attr(node.name);
//     }
//   });
//   return result as T;
// }

// function getAccessChainForNode(node: PyDsl): NodeChain {
//   const structuralChain = [...getStructuralChainForNode(node, new Set())];
//   const accessChain = structuralToAccessChain(structuralChain);
//   if (accessChain.length === 0) {
//     // I _think_ this should not happen, but it does and this fix works for now.
//     // I assume this will cause issues with imports in some cases, investigate
//     // when it actually happens.
//     return [node.clone()];
//   }
//   return accessChain.map((node) => node.clone());
// }

// function getScope(node: PyDsl): NodeScope {
//   return node.scope ?? 'value';
// }

// function getStructuralChainForNode(node: PyDsl, visited: Set<PyDsl>): NodeChain {
//   if (visited.has(node)) return [];
//   visited.add(node);

//   if (isStopNode(node)) return [];

//   if (node.structuralParents) {
//     for (const [parent] of node.structuralParents) {
//       if (getScope(parent) !== getScope(node)) continue;

//       const chain = getStructuralChainForNode(parent, visited);
//       if (chain.length > 0) return [...chain, node];
//     }
//   }

//   if (!node.root) return [];

//   return [node];
// }

// function isAccessorNode(node: PyDsl): boolean {
//   return (
//     node['~dsl'] === 'FieldPyDsl' ||
//     node['~dsl'] === 'GetterPyDsl' ||
//     node['~dsl'] === 'MethodPyDsl'
//   );
// }

// function isStopNode(node: PyDsl): boolean {
//   return node['~dsl'] === 'FuncPyDsl' || node['~dsl'] === 'TemplatePyDsl';
// }

/**
 * Fold a structural chain to an access chain by removing
 * non-accessor nodes.
 */
// function structuralToAccessChain(structuralChain: NodeChain): NodeChain {
//   const accessChain: Array<PyDsl> = [];
//   structuralChain.forEach((node, index) => {
//     // assume first node is always included
//     if (index === 0) {
//       accessChain.push(node);
//     } else if (isAccessorNode(node)) {
//       accessChain.push(node);
//     }
//   });
//   return accessChain;
// }

// function transformAccessChain(accessChain: NodeChain, options: AccessOptions = {}): NodeChain {
//   return accessChain.map((node, index) => {
//     const transformedNode = options.transform?.(node, index, accessChain);
//     if (transformedNode) return transformedNode;
//     const accessNode = node.toAccessNode?.(node, options, {
//       chain: accessChain,
//       index,
//       isLeaf: index === accessChain.length - 1,
//       isRoot: index === 0,
//       length: accessChain.length,
//     });
//     if (accessNode) return accessNode;
//     if (index === 0) {
//       if (node['~dsl'] === 'ClassPyDsl') {
//         const nextNode = accessChain[index + 1];
//         if (nextNode && isAccessorNode(nextNode)) {
//           if ((nextNode as ReturnType<typeof $.field>).hasModifier('static')) {
//             return $(node.name);
//           }
//         }
//         return $.new(node.name).args();
//       }
//       return $(node.name);
//     }
//     return node;
//   });
// }

export class PyDslContext {
  /**
   * Build an expression for accessing the node.
   *
   * @param node - The node or symbol to build access for
   * @param options - Access options
   * @returns Expression for accessing the node
   *
   * @example
   * ```ts
   * ctx.access(node); // → Expression for accessing the node
   * ```
   */
  // access<T = AccessResult>(node: PyDsl | Symbol<PyDsl>, options?: AccessOptions): T {
  //   const n = isSymbol(node) ? node.node : node;
  //   if (!n) {
  //     throw new Error(`Symbol ${node.name} is not resolved to a node.`);
  //   }
  //   const accessChain = getAccessChainForNode(n);
  //   const finalChain = transformAccessChain(accessChain, options);
  //   return accessChainToNode<T>(finalChain);
  // }
  /**
   * Build an example.
   *
   * @param node - The node to generate an example for
   * @param options - Example options
   * @returns Full example string
   *
   * @example
   * ```ts
   * ctx.example(node, { moduleName: 'my-sdk' }); // → Full example string
   * ```
   */
  // example(
  //   node: PyDsl,
  //   options?: ExampleOptions,
  //   astOptions?: Parameters<typeof PythonRenderer.astToString>[0],
  // ): string {
  //   if (astOptions) {
  //     return PythonRenderer.astToString(astOptions);
  //   }
  //   options ||= {};
  //   const accessChain = getAccessChainForNode(node);
  //   if (options.importName) {
  //     accessChain[0]!.name.set(options.importName);
  //   }
  //   const importNode = $(accessChain[0]!.name.toString()); // must store name before transform
  //   const finalChain = transformAccessChain(accessChain, {
  //     context: 'example',
  //   });
  //   const setupNode = options.importSetup
  //     ? typeof options.importSetup === 'function'
  //       ? options.importSetup({ $, node: importNode })
  //       : options.importSetup
  //     : (finalChain[0]! as PyDsl<py.Expression>);
  //   const setupName = options.setupName;
  //   let payload = typeof options.payload === 'function' ? options.payload({ $ }) : options.payload;
  //   payload = payload instanceof Array ? payload : payload ? [payload] : [];
  //   let nodes: Array<PyDsl> = [];
  //   if (setupName) {
  //     nodes = [
  //       $.const(setupName).assign(setupNode),
  //       $.await(accessChainToNode([$(setupName), ...finalChain.slice(1)]).call(...payload)),
  //     ];
  //   } else {
  //     nodes = [$.await(accessChainToNode([setupNode, ...finalChain.slice(1)]).call(...payload))];
  //   }
  //   const localName = importNode.name.toString();
  //   return PythonRenderer.astToString({
  //     imports: [
  //       [
  //         {
  //           imports:
  //             !options.importKind || options.importKind === 'named'
  //               ? [
  //                   {
  //                     isTypeOnly: false,
  //                     localName,
  //                     sourceName: localName,
  //                   },
  //                 ]
  //               : [],
  //           isTypeOnly: false,
  //           kind: options.importKind ?? 'named',
  //           localName: options.importKind !== 'named' ? localName : undefined,
  //           modulePath: options.moduleName ?? 'your-package',
  //         },
  //       ],
  //     ],
  //     nodes,
  //     trailingNewline: false,
  //   });
  // }
}

export const ctx = new PyDslContext();

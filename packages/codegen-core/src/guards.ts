import { nodeBrand, symbolBrand } from './brands';
import type { INode } from './nodes/node';
import type { Ref } from './refs/types';
import type { Symbol } from './symbols/symbol';

export function isBrand(value: unknown, brand: string): value is INode {
  if (!value || typeof value !== 'object') return false;
  return (value as any)['~brand'] === brand;
}

export function isNode(value: unknown): value is INode {
  if (!value || typeof value !== 'object') return false;
  return isBrand(value, nodeBrand);
}

export function isNodeRef(value: Ref<unknown>): value is Ref<INode> {
  return isBrand(value['~ref'], nodeBrand);
}

export function isSymbol(value: unknown): value is Symbol {
  return isBrand(value, symbolBrand);
}

export function isSymbolRef(value: Ref<unknown>): value is Ref<Symbol> {
  return isBrand(value['~ref'], symbolBrand);
}

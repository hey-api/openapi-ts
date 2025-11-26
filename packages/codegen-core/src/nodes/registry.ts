import type { INode } from './node';
import type { INodeRegistry } from './types';

export class NodeRegistry implements INodeRegistry {
  private brands: Map<symbol, Array<INode>> = new Map();
  private list: Array<INode> = [];

  add(node: INode): void {
    this.list.push(node);

    let group = this.brands.get(node['~brand']);
    if (!group) {
      group = [];
      this.brands.set(node['~brand'], group);
    }
    group.push(node);
  }

  all(): ReadonlyArray<INode> {
    return this.list;
  }

  byBrand(brand: symbol): ReadonlyArray<INode> {
    return this.brands.get(brand) ?? [];
  }
}

import { fromRef, ref } from '../refs/refs';
import type { Ref } from '../refs/types';
import type { INode } from './node';
import type { INodeRegistry } from './types';

export class NodeRegistry implements INodeRegistry {
  private list: Array<Ref<INode | null>> = [];

  add(node: INode | null): number {
    const index = this.list.push(ref(node));
    return index - 1;
  }

  *all(): Iterable<INode> {
    for (const r of this.list) {
      const node = fromRef(r);
      if (node) yield node;
    }
  }

  remove(index: number): void {
    this.list[index] = ref(null);
  }

  update(index: number, node: INode | null): void {
    this.list[index] = ref(node);
  }
}

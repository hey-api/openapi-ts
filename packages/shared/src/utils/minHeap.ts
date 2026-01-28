export class MinHeap {
  private heap: Array<string> = [];

  constructor(public declIndex: Map<string, number>) {}

  isEmpty(): boolean {
    return !this.heap.length;
  }

  pop(): string | undefined {
    const [top] = this.heap;
    if (!this.heap.length) return;
    const last = this.heap.pop()!;
    if (!this.heap.length) return top;
    this.heap[0] = last;
    this.sinkDown(0);
    return top;
  }

  push(item: string): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(index: number): void {
    const heap = this.heap;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const parentVal = heap[parent]!;
      const curVal = heap[index]!;
      if (this.declIndex.get(parentVal)! <= this.declIndex.get(curVal)!) break;
      heap[parent] = curVal;
      heap[index] = parentVal;
      index = parent;
    }
  }

  private sinkDown(index: number): void {
    const heap = this.heap;
    const len = heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;
      if (left < len) {
        const leftVal = heap[left]!;
        const smallestVal = heap[smallest]!;
        if (this.declIndex.get(leftVal)! < this.declIndex.get(smallestVal)!)
          smallest = left;
      }
      if (right < len) {
        const rightVal = heap[right]!;
        const smallestVal = heap[smallest]!;
        if (this.declIndex.get(rightVal)! < this.declIndex.get(smallestVal)!)
          smallest = right;
      }
      if (smallest === index) break;
      const tmp = heap[smallest]!;
      heap[smallest] = heap[index]!;
      heap[index] = tmp;
      index = smallest;
    }
  }
}

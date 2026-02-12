import { getIrPointerPriority, matchIrPointerToGroup, preferGroups } from '../../ir/graph';
import { buildGraph } from '../../openApi/shared/utils/graph';
import type { Graph } from '../types/graph';
import { walk } from '../walk';

const loggerStub = {
  timeEvent: () => ({ timeEnd: () => {} }),
} as any;

describe('walkTopological', () => {
  const makeGraph = (deps: Array<[string, Array<string>]>, nodes: Array<string>) => {
    const nodeDependencies = new Map<string, Set<string>>();
    const subtreeDependencies = new Map<string, Set<string>>();
    const reverseNodeDependencies = new Map<string, Set<string>>();
    const nodesMap = new Map<string, any>();

    for (const name of nodes) {
      nodesMap.set(name, { key: null, node: {}, parentPointer: null });
    }

    for (const [from, toList] of deps) {
      const s = new Set<string>(toList);
      nodeDependencies.set(from, s);
      subtreeDependencies.set(from, new Set<string>(toList));
      for (const to of toList) {
        if (!reverseNodeDependencies.has(to)) reverseNodeDependencies.set(to, new Set());
        reverseNodeDependencies.get(to)!.add(from);
      }
    }

    return {
      nodeDependencies,
      nodes: nodesMap,
      reverseNodeDependencies,
      subtreeDependencies,
      transitiveDependencies: new Map<string, Set<string>>(),
    } as unknown as Graph;
  };

  it('walks nodes in topological order for a simple acyclic graph', () => {
    // Graph: A -> B -> C
    const graph = makeGraph(
      [
        ['A', ['B']],
        ['B', ['C']],
      ],
      ['A', 'B', 'C'],
    );
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    expect(order).toHaveLength(3);
  });

  it('walks nodes in topological order for multiple roots', () => {
    // Graph: A -> B, C -> D
    const graph = makeGraph(
      [
        ['A', ['B']],
        ['C', ['D']],
      ],
      ['A', 'B', 'C', 'D'],
    );
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    expect(order.indexOf('D')).toBeLessThan(order.indexOf('C'));
    expect(order).toHaveLength(4);
  });

  it('walks nodes in topological order for a disconnected graph', () => {
    // Graph: A -> B, C (no deps), D (no deps)
    const graph = makeGraph([['A', ['B']]], ['A', 'B', 'C', 'D']);
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    expect(order).toHaveLength(4);
    expect(order).toContain('C');
    expect(order).toContain('D');
  });

  it('walks nodes in topological order for a diamond dependency', () => {
    // Graph:   A
    //         / \
    //        B   C
    //         \ /
    //          D
    const graph = makeGraph(
      [
        ['A', ['B', 'C']],
        ['B', ['D']],
        ['C', ['D']],
      ],
      ['A', 'B', 'C', 'D'],
    );
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.indexOf('D')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('D')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('A'));
    expect(order).toHaveLength(4);
  });

  it('walks nodes in topological order for a long chain', () => {
    // Graph: A -> B -> C -> D -> E
    const graph = makeGraph(
      [
        ['A', ['B']],
        ['B', ['C']],
        ['C', ['D']],
        ['D', ['E']],
      ],
      ['A', 'B', 'C', 'D', 'E'],
    );
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.indexOf('E')).toBeLessThan(order.indexOf('D'));
    expect(order.indexOf('D')).toBeLessThan(order.indexOf('C'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    expect(order).toHaveLength(5);
  });

  it('walks all nodes, including cycles', () => {
    // Graph: A <-> B (cycle), C (no deps)
    const graph = makeGraph(
      [
        ['A', ['B']],
        ['B', ['A']],
      ],
      ['A', 'B', 'C'],
    );
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.sort()).toEqual(['A', 'B', 'C']);
  });

  it('matches ordering for validators-circular-ref spec', async () => {
    const specModule = await import('../../../../../specs/3.1.x/validators-circular-ref.json');
    const spec = specModule.default ?? specModule;
    const { graph } = buildGraph(spec, loggerStub);

    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });

    const foo = '#/components/schemas/Foo';
    const bar = '#/components/schemas/Bar';
    const baz = '#/components/schemas/Baz';
    const qux = '#/components/schemas/Qux';

    // Bar should come before Foo because Foo depends on Bar
    expect(order.indexOf(bar)).toBeLessThan(order.indexOf(foo));

    // Baz and Qux form a mutual $ref cycle; both must be present
    expect(order).toContain(baz);
    expect(order).toContain(qux);
  });

  it('prefers schema group before parameter when safe (default)', () => {
    // parameter then schema in declaration order, no deps -> schema should move before parameter
    const param = '#/components/parameters/P';
    const schema = '#/components/schemas/A';
    const nodes = [param, schema];
    const graph = makeGraph([], nodes);

    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), {
      getPointerPriority: getIrPointerPriority,
      matchPointerToGroup: matchIrPointerToGroup,
      order: 'topological',
      preferGroups,
    });
    expect(order.indexOf(schema)).toBeLessThan(order.indexOf(param));
  });

  it('does not apply preferGroups when it would violate dependencies (fallback)', () => {
    // declaration order: param, schema; schema depends on param -> cannot move before param
    const param = '#/components/parameters/P';
    const schema = '#/components/schemas/S';
    const nodes = [param, schema];
    const nodeDependencies = new Map<string, Set<string>>();
    nodeDependencies.set(schema, new Set([param]));
    const subtreeDependencies = new Map<string, Set<string>>();
    const reverseNodeDependencies = new Map<string, Set<string>>();
    const nodesMap = new Map<string, any>();
    for (const n of nodes) nodesMap.set(n, { key: null, node: {}, parentPointer: null });
    const graph = {
      nodeDependencies,
      nodes: nodesMap,
      reverseNodeDependencies,
      subtreeDependencies,
      transitiveDependencies: new Map<string, Set<string>>(),
    } as unknown as Graph;

    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    // schema depends on param so param must remain before schema
    expect(order.indexOf(param)).toBeLessThan(order.indexOf(schema));
  });

  it('ignores self-dependencies when ordering', () => {
    // Foo has self-ref only, Bar references Foo -> Foo should come before Bar
    const foo = '#/components/schemas/Foo';
    const bar = '#/components/schemas/Bar';
    const nodes = [foo, bar];
    const nodeDependencies = new Map<string, Set<string>>();
    nodeDependencies.set(foo, new Set([foo]));
    nodeDependencies.set(bar, new Set([foo]));

    const nodesMap = new Map<string, any>();
    for (const n of nodes) nodesMap.set(n, { key: null, node: {}, parentPointer: null });

    const graph = {
      nodeDependencies,
      nodes: nodesMap,
      reverseNodeDependencies: new Map<string, Set<string>>(),
      subtreeDependencies: new Map<string, Set<string>>(),
      transitiveDependencies: new Map<string, Set<string>>(),
    } as unknown as Graph;

    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    // Foo is a dependency of Bar, so Foo should come before Bar
    expect(order.indexOf(foo)).toBeLessThan(order.indexOf(bar));
  });

  it('uses subtreeDependencies when nodeDependencies are absent', () => {
    const parent = '#/components/schemas/Parent';
    const child = '#/components/schemas/Child';
    const nodes = [parent, child];
    const nodeDependencies = new Map<string, Set<string>>();
    const subtreeDependencies = new Map<string, Set<string>>();
    subtreeDependencies.set(parent, new Set([child]));

    const nodesMap = new Map<string, any>();
    for (const n of nodes) nodesMap.set(n, { key: null, node: {}, parentPointer: null });

    const graph = {
      nodeDependencies,
      nodes: nodesMap,
      reverseNodeDependencies: new Map<string, Set<string>>(),
      subtreeDependencies,
      transitiveDependencies: new Map<string, Set<string>>(),
    } as unknown as Graph;

    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order.indexOf(child)).toBeLessThan(order.indexOf(parent));
  });

  it('preserves declaration order for equal-priority items (stability)', () => {
    const a = '#/components/schemas/A';
    const b = '#/components/schemas/B';
    const c = '#/components/schemas/C';
    const nodes = [a, b, c];
    const graph = makeGraph([], nodes);
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'topological' });
    expect(order).toEqual(nodes);
  });

  it('walks nodes in declaration order when order=declarations', () => {
    const a = '#/components/schemas/A';
    const b = '#/components/schemas/B';
    const c = '#/components/schemas/C';
    const nodes = [a, b, c];
    const graph = makeGraph([], nodes);
    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), { order: 'declarations' });
    expect(order).toEqual(nodes);
  });

  it('applies preferGroups ordering in declaration mode', () => {
    const param = '#/components/parameters/P';
    const schema = '#/components/schemas/A';
    const nodes = [param, schema];
    const graph = makeGraph([], nodes);

    const order: Array<string> = [];
    walk(graph, (pointer) => order.push(pointer), {
      matchPointerToGroup: matchIrPointerToGroup,
      order: 'declarations',
      preferGroups,
    });
    // preferGroups puts schema before parameter
    expect(order.indexOf(schema)).toBeLessThan(order.indexOf(param));
  });
});

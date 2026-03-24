import { canDeclarationsShareIdentifier } from '../project/namespace';
import { Project } from '../project/project';
import type { SymbolKind } from '../symbols/types';

// Mock Planner so we control what files appear in project.files
vi.mock('../planner/planner', () => {
  const MockPlanner = vi.fn(function (this: any, project: Project) {
    this.plan = vi.fn(() => {
      // planner is responsible for creating files
      const file = project.files.register({
        logicalFilePath: 'root/a',
      });
      file.setFinalPath('/root/a.ts');
      file.setRenderer({
        render: vi.fn(() => 'RENDERED'),
        supports: () => true,
      });
    });
  });

  return { Planner: MockPlanner };
});

describe('Project', () => {
  const makeProject = (overrides: any = {}) =>
    new Project({
      renderers: [],
      root: '/root',
      ...overrides,
    });

  it('calls Planner.plan() before rendering', () => {
    const p = makeProject();
    p.render();
  });

  it('renders files created by the planner', () => {
    const p = makeProject();

    const out = p.render();

    expect(out).toEqual([{ content: 'RENDERED', path: '/root/a.ts' }]);
  });

  it('passes correct ctx to renderer.render()', () => {
    const p = makeProject();
    p.render({ hello: true });

    const file = [...p.files.registered()][0]!;
    const renderer = file.renderer!;

    expect(renderer.render).toHaveBeenCalledWith({
      file,
      meta: { hello: true },
      project: p,
    });
  });
});

describe('canDeclarationsShareIdentifier', () => {
  const kinds: ReadonlyArray<SymbolKind> = [
    'class',
    'enum',
    'function',
    'interface',
    'namespace',
    'type',
    'var',
  ];

  it('matches TypeScript declaration merging matrix', () => {
    const allowed = new Set([
      'interface|interface',
      'class|interface',
      'class|namespace',
      'enum|namespace',
      'function|namespace',
      'namespace|namespace',
      'function|type',
      'type|var',
    ]);

    for (const a of kinds) {
      for (const b of kinds) {
        expect(canDeclarationsShareIdentifier('typescript', a, b)).toBe(
          allowed.has([a, b].sort().join('|')),
        );
      }
    }
  });

  it('returns false for Python declaration pairs', () => {
    for (const a of kinds) {
      for (const b of kinds) {
        expect(canDeclarationsShareIdentifier('python', a, b)).toBe(false);
      }
    }
  });
});

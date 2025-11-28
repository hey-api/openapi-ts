import { describe, expect, it } from 'vitest';

import * as index from '../index';

const constExports = [
  'debug',
  'fromRef',
  'fromRefs',
  'isNode',
  'isNodeRef',
  'isRef',
  'isSymbol',
  'isSymbolRef',
  'nodeBrand',
  'Project',
  'ref',
  'refs',
  'Symbol',
  'symbolBrand',
];

// Type-level test: will fail to compile if any type export is missing or renamed
export type _TypeExports = [
  index.AnalysisContext,
  index.File,
  index.FileIdentifier,
  index.FileIn,
  index.FromRef<any>,
  index.FromRefs<any>,
  index.IProject,
  index.Node,
  index.Output,
  index.PlannedExport,
  index.PlannedImport,
  index.PlannedReexport,
  index.Project,
  index.ProjectRenderMeta,
  index.Ref<any>,
  index.Refs<any>,
  index.RenderContext,
  index.Renderer,
  index.Symbol,
  index.SymbolIdentifier,
  index.SymbolIn,
  index.SymbolMeta,
];

describe('index exports', () => {
  it('should export all expected symbols', () => {
    for (const key of constExports) {
      expect(index).toHaveProperty(key);
    }
  });
});

import { describe, expect, it } from 'vitest';

import * as index from '../index';

const constExports = [
  'debug',
  'defaultExtensions',
  'defaultNameConflictResolvers',
  'File',
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
  'simpleNameConflictResolver',
  'Symbol',
  'symbolBrand',
  'underscoreNameConflictResolver',
];

// Type-level test: will fail to compile if any type export is missing or renamed
export type _TypeExports = [
  index.AnalysisContext,
  index.BindingKind,
  index.ExportMember,
  index.ExportModule,
  index.Extensions,
  index.File,
  index.FileIn,
  index.FromRef<any>,
  index.FromRefs<any>,
  index.ImportMember,
  index.ImportModule,
  index.IProject,
  index.Language,
  index.NameConflictResolver,
  index.NameConflictResolvers,
  index.Node,
  index.NodeName,
  index.NodeNameSanitizer,
  index.NodeRelationship,
  index.NodeScope,
  index.Output,
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

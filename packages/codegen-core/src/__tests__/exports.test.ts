import { describe, expect, it } from 'vitest';

import * as index from '../index';

const constExports = ['createBinding', 'mergeBindings', 'Project', 'renderIds'];

// Type-level test: will fail to compile if any type export is missing or renamed
export type _TypeExports = [
  index.BiMap<string, string>,
  index.Binding,
  index.ProjectRenderMeta,
  index.SymbolMeta,
  index.File,
  index.FileIn,
  index.Output,
  index.IProject,
  index.Renderer,
  index.Selector,
  index.Symbol,
  index.SymbolIn,
];

describe('index exports', () => {
  it('should export all expected symbols', () => {
    for (const key of constExports) {
      expect(index).toHaveProperty(key);
    }
  });
});

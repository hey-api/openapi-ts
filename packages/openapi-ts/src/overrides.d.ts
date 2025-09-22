import '@hey-api/codegen-core';

import type ts from 'typescript';

declare module '@hey-api/codegen-core' {
  interface ProjectRenderMeta {
    moduleResolution?: ts.ModuleResolutionKind;
  }

  interface SymbolMeta {
    /**
     * Name of the plugin that registered this symbol.
     */
    pluginName?: string;
  }
}

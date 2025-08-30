import '@hey-api/codegen-core';

import type ts from 'typescript';

declare module '@hey-api/codegen-core' {
  interface ICodegenMeta {
    moduleResolution?: ts.ModuleResolutionKind;
  }
}

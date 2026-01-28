import type { MaybePromise } from '@hey-api/types';

import type { CodeSampleObject } from '..//openApi/shared/types';
import type { IR } from './types';

export interface ExampleIntent {
  run(ctx: IntentContext): MaybePromise<void>;
}

export class IntentContext<Spec extends Record<string, any> = any> {
  private spec: Spec;

  constructor(spec: Spec) {
    this.spec = spec;
  }

  private getOperation(
    path: string,
    method: string,
  ): Record<string, any> | undefined {
    const paths = (this.spec as any).paths;
    if (!paths) return;
    return paths[path]?.[method];
  }

  setExample(operation: IR.OperationObject, example: CodeSampleObject): void {
    const source = this.getOperation(operation.path, operation.method);
    if (!source) return;
    source['x-codeSamples'] ||= [];
    source['x-codeSamples'].push(example);
  }
}

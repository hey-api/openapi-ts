import type { RenderContext } from '@hey-api/codegen-core';
import type { MaybeArray, MaybeFunc } from '@hey-api/types';

export type OutputHeader = MaybeFunc<
  (
    ctx: Omit<RenderContext, 'file'> & Pick<Partial<RenderContext>, 'file'>,
  ) => MaybeArray<string> | null | undefined
>;

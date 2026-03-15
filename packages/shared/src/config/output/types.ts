import type { RenderContext } from '@hey-api/codegen-core';
import type { MaybeArray, MaybeFunc } from '@hey-api/types';

export type OutputHeader = MaybeFunc<
  (
    ctx: Pick<RenderContext, 'meta' | 'project'> &
      Pick<Partial<RenderContext>, 'file'> & {
        /** The default header value. */
        defaultValue: ReadonlyArray<string>;
      },
  ) => MaybeArray<string> | null | undefined
>;

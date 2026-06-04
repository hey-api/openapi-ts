// Type-only regression test for the typesafe `meta` option.
//
// `meta` is generated as `meta?: Meta`, where `Meta` is a conditional type that
// falls back to `Record<string, unknown>` while the augmentable `ClientMeta`
// interface is empty, and becomes the strict `ClientMeta` once a user augments it.
// This file is checked by `tsgo --noEmit` (see the `typecheck` script); it is not a
// vitest test. Module augmentation is keyed per module specifier, so augmenting the
// `flat` snapshot's client does not affect the `grouped` snapshot used below as the
// unaugmented case.

import type { Options as FlatOptions } from '../__snapshots__/opencode/flat/sdk.gen';
import type { Options as GroupedOptions } from '../__snapshots__/opencode/grouped/sdk.gen';

declare module '../__snapshots__/opencode/flat/client' {
  interface ClientMeta {
    retry?: boolean;
  }
}

// --- Augmented (flat): strict. ---
// Declared key with the correct type is allowed.
export const ok: FlatOptions = { meta: { retry: true } };
// @ts-expect-error - unknown/typo'd key is rejected.
export const typo: FlatOptions = { meta: { retryy: true } };
// @ts-expect-error - wrong value type is rejected.
export const wrongType: FlatOptions = { meta: { retry: 'nope' } };
// @ts-expect-error - a primitive is rejected.
export const primitive: FlatOptions = { meta: 5 };

// --- Unaugmented (grouped): behaves like Record<string, unknown> (backward compatible). ---
// Arbitrary object keys are accepted.
export const anyObject: GroupedOptions = { meta: { anything: 1, nested: { x: true } } };
// @ts-expect-error - but a primitive is still rejected, exactly like the previous default.
export const groupedPrimitive: GroupedOptions = { meta: 5 };

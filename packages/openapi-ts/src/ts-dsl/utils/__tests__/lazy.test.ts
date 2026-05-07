import { describe, expect, it, vi } from 'vitest';

import { $ } from '../../index';

describe('LazyTsDsl', () => {
  it('returns the same instance on every call to toResult()', () => {
    const lazy = $.lazy(() => $('x'));
    const first = lazy.toResult();
    const second = lazy.toResult();
    expect(first).toBe(second);
  });

  it('invokes the thunk exactly once regardless of how many times toResult() is called', () => {
    const thunk = vi.fn(() => $('x'));
    const lazy = $.lazy(thunk);
    lazy.toResult();
    lazy.toResult();
    lazy.toResult();
    expect(thunk).toHaveBeenCalledTimes(1);
  });

  it('toAst() uses the cached result, not a fresh thunk invocation', () => {
    const thunk = vi.fn(() => $('x'));
    const lazy = $.lazy(thunk);
    lazy.toResult();
    lazy.toAst();
    expect(thunk).toHaveBeenCalledTimes(1);
  });
});

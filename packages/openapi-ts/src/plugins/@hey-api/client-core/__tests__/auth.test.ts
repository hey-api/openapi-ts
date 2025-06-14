import { describe, expect, it, vi } from 'vitest';

import { getAuthToken } from '../bundle/auth';

describe('getAuthToken', () => {
  it('returns bearer token', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const token = await getAuthToken(
      {
        scheme: 'bearer',
        type: 'http',
      },
      auth,
    );
    expect(auth).toHaveBeenCalled();
    expect(token).toBe('Bearer foo');
  });

  it('returns basic token', async () => {
    const auth = vi.fn().mockReturnValue('foo:bar');
    const token = await getAuthToken(
      {
        scheme: 'basic',
        type: 'http',
      },
      auth,
    );
    expect(auth).toHaveBeenCalled();
    expect(token).toBe(`Basic ${btoa('foo:bar')}`);
  });

  it('returns raw token', async () => {
    const auth = vi.fn().mockReturnValue('foo');
    const token = await getAuthToken(
      {
        type: 'http',
      },
      auth,
    );
    expect(auth).toHaveBeenCalled();
    expect(token).toBe('foo');
  });

  it('returns nothing when auth function is undefined', async () => {
    const token = await getAuthToken(
      {
        type: 'http',
      },
      undefined,
    );
    expect(token).toBeUndefined();
  });
});

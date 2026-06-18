import { createClient } from '@hey-api/openapi-ts';
import type { Mock } from 'vitest';

vi.mock('@hey-api/openapi-ts', () => ({
  createClient: vi.fn().mockResolvedValue([]),
}));

const spy = createClient as Mock;

import { heyApiPlugin } from '../index';

function callConfigResolved(plugin: ReturnType<typeof heyApiPlugin>) {
  const hook = plugin.configResolved;
  if (typeof hook === 'function') {
    return hook.call({} as never, {} as never);
  }
  if (hook) {
    return hook.handler.call({} as never, {} as never);
  }
}

describe('heyApiPlugin', () => {
  beforeEach(() => {
    spy.mockClear();
  });

  it('passes empty object to createClient when called with no options', async () => {
    const plugin = heyApiPlugin();
    await callConfigResolved(plugin);

    expect(spy).toHaveBeenCalledWith({});
  });

  it('passes provided config to createClient', async () => {
    const config = { input: 'spec.json', output: 'src/client' };
    const plugin = heyApiPlugin({ config });

    await callConfigResolved(plugin);

    expect(spy).toHaveBeenCalledWith(config);
  });
});

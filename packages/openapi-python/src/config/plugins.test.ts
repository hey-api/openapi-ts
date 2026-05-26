import { definePluginConfig, type Plugin } from '@hey-api/shared';

import { getPlugins } from './plugins';

type CustomPlugin = Plugin.Types<
  { name: 'custom-plugin'; value?: string },
  { enabled: boolean; name: 'custom-plugin'; value: string }
>;

describe('getPlugins', () => {
  it('normalizes custom plugins with function defaults', () => {
    const defineConfig = definePluginConfig<CustomPlugin>({
      config: (config: { value?: string }) => ({
        enabled: true,
        name: 'custom-plugin',
        value: config.value ?? 'default',
      }),
      handler: vi.fn(),
      name: 'custom-plugin',
    });

    const { plugins } = getPlugins({
      dependencies: {},
      userConfig: {
        plugins: [defineConfig({ value: 'custom' })],
      } as any,
    });

    expect(plugins['custom-plugin']!.config).toMatchObject({
      enabled: true,
      name: 'custom-plugin',
      value: 'custom',
    });
  });
});

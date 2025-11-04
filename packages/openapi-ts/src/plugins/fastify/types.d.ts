import type { DefinePlugin, Plugin } from '~/plugins';

export type UserConfig = Plugin.Name<'fastify'> &
  Plugin.Hooks & {
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
  };

export type FastifyPlugin = DefinePlugin<UserConfig, UserConfig>;

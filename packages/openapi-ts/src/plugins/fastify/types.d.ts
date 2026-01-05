import type { DefinePlugin, Plugin } from '~/plugins';

export type UserConfig = Plugin.Name<'fastify'> &
  Plugin.Hooks & {
    /**
     * Whether exports should be re-exported in the index file.
     *
     * @default false
     */
    exportFromIndex?: boolean;
  };

export type FastifyPlugin = DefinePlugin<UserConfig, UserConfig>;

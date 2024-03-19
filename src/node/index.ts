import type { UserConfig } from '../types/config';

export type { UserConfig } from '../types/config';

/**
 * Type helper for openapi-ts.config.ts, returns {@link UserConfig} object
 */
export function defineConfig(config: UserConfig): UserConfig {
    return config;
}

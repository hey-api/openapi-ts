import type { Icon } from '@astrojs/starlight/components';
import type { ComponentProps } from 'astro/types';

export const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;

export type Manager = (typeof MANAGERS)[number];

export type IconName = ComponentProps<typeof Icon>['name'];

export const MANAGER_ICONS: Record<Manager, IconName> = {
  bun: 'bun',
  npm: 'npm',
  pnpm: 'pnpm',
  yarn: 'seti:yarn',
};

export interface PackageManagerItem {
  command: string;
  icon: IconName;
  label: Manager;
}

export function getPackageManagerItems(
  props: Partial<Record<Manager, string>>,
): Array<PackageManagerItem> {
  return MANAGERS.flatMap((m) =>
    props[m] !== undefined ? [{ command: props[m]!, icon: MANAGER_ICONS[m], label: m }] : [],
  );
}

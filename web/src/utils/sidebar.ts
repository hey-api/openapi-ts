import type { Badge } from '@astrojs/starlight/components';
import type { ComponentProps } from 'astro/types';

import { versionedRoutes } from '@/data/versions';

export interface SidebarEntry {
  attrs?: Record<string, unknown>;
  badge?: ComponentProps<typeof Badge>;
  collapsed?: boolean;
  entries?: Array<SidebarEntry>;
  href?: string;
  isCurrent?: boolean;
  label: string;
  type: 'link' | 'group';
}

export function isCurrentEntry(entry: SidebarEntry, currentPath: string): boolean {
  if (entry.isCurrent) return true;
  if (!entry.href) return false;
  if (!versionedRoutes[entry.href]) return false;
  if (!currentPath.startsWith(entry.href)) return false;
  const rest = currentPath.slice(entry.href.length);
  return rest.startsWith('/') && !rest.slice(1).includes('/');
}

export function flattenSidebar(entries: Array<SidebarEntry>): Array<SidebarEntry> {
  return entries.flatMap((e) => (e.type === 'group' ? flattenSidebar(e.entries ?? []) : [e]));
}

export function hasCurrentEntry(entries: Array<SidebarEntry>, currentPath: string): boolean {
  return flattenSidebar(entries).some((e) => isCurrentEntry(e, currentPath));
}

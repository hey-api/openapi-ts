import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

function findGroupLabel(sidebar: StarlightRouteData['sidebar'], href: string): string | undefined {
  for (const entry of sidebar) {
    if (entry.type === 'group') {
      const first = entry.entries[0];
      if (first?.type === 'link' && first.href === href && first.label === 'Overview') {
        return entry.label;
      }
      const nested = findGroupLabel(entry.entries, href);
      if (nested) return nested;
    }
  }
}

function usePageTitleInTOC(starlightRoute: StarlightRouteData) {
  const overviewLink = starlightRoute.toc?.items[0];
  if (overviewLink) {
    overviewLink.text = starlightRoute.entry.data.title;
  }
}

export const onRequest = defineRouteMiddleware((context) => {
  usePageTitleInTOC(context.locals.starlightRoute);

  const { pagination, sidebar } = context.locals.starlightRoute;

  if (pagination.prev) {
    const label = findGroupLabel(sidebar, pagination.prev.href);
    if (label) pagination.prev.label = label;
  }
  if (pagination.next) {
    const label = findGroupLabel(sidebar, pagination.next.href);
    if (label) pagination.next.label = label;
  }
});

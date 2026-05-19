import type { Icon } from '@astrojs/starlight/components';
import type { ComponentProps } from 'astro/types';

export interface NavigationItem {
  badge?: 'soon';
  description?: string;
  icon?: ComponentProps<typeof Icon>['name'];
  label: string;
  link?: string;
}

export interface NavigationMenu {
  columns?: number;
  items: Array<NavigationItem>;
  label: string;
}

export const navigation: Array<NavigationMenu> = [
  {
    items: [
      {
        description: 'OpenAPI to TypeScript code generator',
        label: 'Codegen',
        link: '/codegen/openapi/typescript',
      },
    ],
    label: 'Products',
  },
  {
    items: [
      {
        description: 'Get started, guides, and reference',
        label: 'TypeScript',
        link: '/docs/openapi/typescript/get-started',
      },
      {
        badge: 'soon',
        description: 'Get started, guides, and reference',
        label: 'Python',
      },
    ],
    label: 'Docs',
  },
  {
    items: [
      {
        description: 'Fund open-source development',
        label: 'Sponsors',
        link: '/sponsors',
      },
      {
        icon: 'github',
        label: 'GitHub',
        link: 'https://github.com/orgs/hey-api/discussions',
      },
    ],
    label: 'Community',
  },
];

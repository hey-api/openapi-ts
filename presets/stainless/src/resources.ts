import type { ResourceConfig } from './schema';

interface ResourceEntry {
  methodName: string;
  resourcePath: ReadonlyArray<string>;
}

export function walkResources(
  resources: Record<string, ResourceConfig | undefined>,
  parentPath: ReadonlyArray<string> = [],
): Map<string, ResourceEntry> {
  const entries = new Map<string, ResourceEntry>();

  for (const [resourceName, resource] of Object.entries(resources)) {
    if (!resource) continue;

    const currentPath = [...parentPath, resourceName];

    if (resource.methods) {
      for (const [methodName, methodSpec] of Object.entries(resource.methods)) {
        if (typeof methodSpec === 'string') {
          const key = methodSpec.trim().toLowerCase();
          entries.set(key, {
            methodName,
            resourcePath: currentPath,
          });
        }
      }
    }

    if (resource.subresources) {
      for (const [key, value] of walkResources(resource.subresources, currentPath)) {
        entries.set(key, value);
      }
    }
  }

  return entries;
}

export function buildResourceStrategy(
  resources: Record<string, ResourceConfig | undefined>,
): (operation: {
  id: string;
  method: string;
  path: string;
}) => ReadonlyArray<ReadonlyArray<string>> {
  const lookup = walkResources(resources);

  return (operation) => {
    const key = `${operation.method.toLowerCase()} ${operation.path}`;
    const entry = lookup.get(key);

    if (entry) {
      return [[...entry.resourcePath, entry.methodName]];
    }

    return [[operation.id]];
  };
}

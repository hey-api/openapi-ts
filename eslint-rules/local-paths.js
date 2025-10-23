import path from 'node:path';

function normalize(p) {
  return p.split(path.sep).join('/');
}

function stripExtAndIndex(p) {
  return p
    .replace(/(\/index)?\.(ts|tsx|js|cjs|mjs|d\.ts)$/, '')
    .replace(/\/index$/, '');
}

/**
 * Single consolidated rule implementing the previous three behaviors:
 * - plugins: allow relative within same plugin (plugin may be @scope/name), else require `~`
 * - openApi: allow relative only within same first-level openApi folder, else require `~`
 * - first-level folders: allow relative only within same first-level folder, else require `~`
 */
const enforceLocalPaths = {
  create(context) {
    const filename = context.getFilename();
    if (!filename || filename === '<input>') return {};

    const normalizedFile = normalize(filename);
    const srcMarker = '/packages/openapi-ts/src/';
    const srcIdx = normalizedFile.indexOf(srcMarker);
    if (srcIdx === -1) return {};

    const after = normalizedFile.slice(srcIdx + srcMarker.length);
    const parts = after.split('/');
    const firstLevel = parts[0];

    // helpers and mode-specific roots
    // compute the absolute normalized bundle root for accurate comparisons
    let bundleAbsRoot =
      normalizedFile.slice(0, srcIdx + srcMarker.length) +
      'plugins/@hey-api/client-core/bundle/';
    bundleAbsRoot = normalize(bundleAbsRoot);

    let mode = 'first-level';
    let pluginAbsRoot = null;
    let openApiFirstRoot = null;
    let firstRoot = null;

    if (firstLevel === 'plugins') {
      mode = 'plugins';
      // derive plugin folder (support scoped plugin names)
      let pluginFolder = parts[1] || '';
      if (pluginFolder.startsWith('@') && parts.length > 2) {
        pluginFolder = `${pluginFolder}/${parts[2]}`;
      }
      pluginAbsRoot =
        normalizedFile.slice(0, srcIdx + srcMarker.length) +
        `plugins/${pluginFolder}/`;
      pluginAbsRoot = normalize(pluginAbsRoot);
    } else if (firstLevel === 'openApi') {
      mode = 'openApi';
      const apiFirst = parts[1] || '';
      openApiFirstRoot =
        normalizedFile.slice(0, srcIdx + srcMarker.length) +
        `openApi/${apiFirst}/`;
      openApiFirstRoot = normalize(openApiFirstRoot);
    } else {
      firstRoot =
        normalizedFile.slice(0, srcIdx + srcMarker.length) + `${firstLevel}/`;
      firstRoot = normalize(firstRoot);
    }

    function resolveFromBasedir(basedir, sourceValue) {
      try {
        return path.resolve(basedir, sourceValue);
      } catch {
        return null;
      }
    }

    function resolveTildeToAbs(sourceValue) {
      const rest = sourceValue.replace(/^~\/?/, '');
      return path.resolve(process.cwd(), 'packages/openapi-ts/src', rest);
    }

    function toTilde(resolvedAbsolutePath) {
      const normalized = normalize(resolvedAbsolutePath);
      const marker = '/packages/openapi-ts/src/';
      const i = normalized.indexOf(marker);
      if (i === -1) return null;
      let rest = normalized.slice(i + marker.length);
      rest = stripExtAndIndex(rest);
      return `~/${rest}`;
    }

    function reportReplaceWithTilde(node, sourceValue, message) {
      const basedir = path.dirname(filename);
      const resolved = resolveFromBasedir(basedir, sourceValue);
      if (!resolved) return;
      const newImport = toTilde(resolved);
      if (!newImport) return;
      context.report({
        fix(fixer) {
          return fixer.replaceText(node.source, `'${newImport}'`);
        },
        message,
        node: node.source,
      });
    }

    function reportReplaceWithRelative(node, sourceValue, message) {
      const resolved = resolveTildeToAbs(sourceValue);
      if (!resolved) return;
      let relativePath = path
        .relative(path.dirname(filename), resolved)
        .split(path.sep)
        .join('/');
      relativePath = stripExtAndIndex(relativePath);
      if (!relativePath.startsWith('.')) relativePath = `./${relativePath}`;
      context.report({
        fix(fixer) {
          return fixer.replaceText(node.source, `'${relativePath}'`);
        },
        message,
        node: node.source,
      });
    }

    function shouldRewriteRelative(sourceValue) {
      if (typeof sourceValue !== 'string') return false;
      if (!sourceValue.startsWith('.')) return false;
      const basedir = path.dirname(filename);
      const resolved = resolveFromBasedir(basedir, sourceValue);
      if (!resolved) return false;
      const nr = normalize(resolved);
      if (!nr.includes('/packages/openapi-ts/src/')) return false;

      if (mode === 'plugins') {
        if (nr.startsWith(pluginAbsRoot)) return false; // inside same plugin -> keep relative
        if (nr.startsWith(bundleAbsRoot)) return false; // client-core bundle: keep relative
        return true;
      }

      if (mode === 'openApi') {
        // if target is inside same first-level openApi folder -> don't rewrite
        if (nr.startsWith(openApiFirstRoot)) return false;
        // only rewrite if target is inside openApi at all
        return nr.includes('/packages/openapi-ts/src/openApi/');
      }

      // generic first-level folder rule
      if (nr.startsWith(firstRoot)) return false;
      return true;
    }

    function shouldRewriteTilde(sourceValue) {
      if (typeof sourceValue !== 'string') return false;
      if (!sourceValue.startsWith('~')) return false;
      const resolved = resolveTildeToAbs(sourceValue);
      if (!resolved) return false;
      const nr = normalize(resolved);

      if (mode === 'plugins') {
        // prefer relative imports for same-plugin targets or for the shared client-core bundle
        return nr.startsWith(pluginAbsRoot) || nr.startsWith(bundleAbsRoot);
      }
      if (mode === 'openApi') {
        return nr.startsWith(openApiFirstRoot);
      }
      return nr.startsWith(firstRoot);
    }

    return {
      ExportAllDeclaration(node) {
        const sourceValue = node.source && node.source.value;
        if (shouldRewriteRelative(sourceValue)) {
          reportReplaceWithTilde(
            node,
            sourceValue,
            'Prefer `~` export for cross-boundary exports (autofixable).',
          );
          return;
        }
        if (shouldRewriteTilde(sourceValue)) {
          reportReplaceWithRelative(
            node,
            sourceValue,
            'Prefer relative export for intra-boundary targets (autofixable).',
          );
          return;
        }
      },
      ImportDeclaration(node) {
        const sourceValue = node.source && node.source.value;
        if (shouldRewriteRelative(sourceValue)) {
          reportReplaceWithTilde(
            node,
            sourceValue,
            'Prefer `~` import for cross-boundary imports (autofixable).',
          );
          return;
        }
        if (shouldRewriteTilde(sourceValue)) {
          reportReplaceWithRelative(
            node,
            sourceValue,
            'Prefer relative import for intra-boundary targets (autofixable).',
          );
          return;
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        'Enforce local import path boundaries for openapi-ts sources',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
};

export default {
  configs: {
    recommended: {
      rules: {
        'local-paths/enforce-local-paths': 'error',
      },
    },
  },
  rules: {
    'enforce-local-paths': enforceLocalPaths,
  },
};

import type { $RefParser } from '.';
import type { ParserOptions } from './options';
import Pointer from './pointer';
import $Ref from './ref';
import type $Refs from './refs';
import type { JSONSchema } from './types';
import { MissingPointerError } from './util/errors';
import * as url from './util/url';

export interface InventoryEntry {
  $ref: any;
  circular: any;
  depth: any;
  extended: any;
  external: any;
  file: any;
  hash: any;
  indirections: any;
  key: any;
  originalContainerType?: 'schemas' | 'parameters' | 'requestBodies' | 'responses' | 'headers';
  parent: any;
  pathFromRoot: any;
  value: any;
}

/**
 * Fast lookup using Map instead of linear search with deep equality
 */
const createInventoryLookup = () => {
  const lookup = new Map<string, InventoryEntry>();
  const objectIds = new WeakMap<object, string>(); // Use WeakMap to avoid polluting objects
  let idCounter = 0;

  const getObjectId = (obj: any) => {
    if (!objectIds.has(obj)) {
      objectIds.set(obj, `obj_${++idCounter}`);
    }
    return objectIds.get(obj)!;
  };

  const createInventoryKey = ($refParent: any, $refKey: any) =>
    // Use WeakMap-based lookup to avoid polluting the actual schema objects
    `${getObjectId($refParent)}_${$refKey}`;

  return {
    add: (entry: InventoryEntry) => {
      const key = createInventoryKey(entry.parent, entry.key);
      lookup.set(key, entry);
    },
    find: ($refParent: any, $refKey: any) => {
      const key = createInventoryKey($refParent, $refKey);
      const result = lookup.get(key);
      return result;
    },
    remove: (entry: InventoryEntry) => {
      const key = createInventoryKey(entry.parent, entry.key);
      lookup.delete(key);
    },
  };
};

/**
 * Determine the container type from a JSON Pointer path.
 * Analyzes the path tokens to identify the appropriate OpenAPI component container.
 *
 * @param path - The JSON Pointer path to analyze
 * @returns The container type: "schemas", "parameters", "requestBodies", "responses", or "headers"
 */
const getContainerTypeFromPath = (
  path: string,
): 'schemas' | 'parameters' | 'requestBodies' | 'responses' | 'headers' => {
  const tokens = Pointer.parse(path);
  const has = (t: string) => tokens.includes(t);
  // Prefer more specific containers first
  if (has('parameters')) {
    return 'parameters';
  }
  if (has('requestBody')) {
    return 'requestBodies';
  }
  if (has('headers')) {
    return 'headers';
  }
  if (has('responses')) {
    return 'responses';
  }
  if (has('schema')) {
    return 'schemas';
  }
  // default: treat as schema-like
  return 'schemas';
};

/**
 * Inventories the given JSON Reference (i.e. records detailed information about it so we can
 * optimize all $refs in the schema), and then crawls the resolved value.
 */
const inventory$Ref = <S extends object = JSONSchema>({
  $refKey,
  $refParent,
  $refs,
  indirections,
  inventory,
  inventoryLookup,
  options,
  path,
  pathFromRoot,
  resolvedRefs = new Map(),
  visitedObjects = new WeakSet(),
}: {
  /**
   * The key in `$refParent` that is a JSON Reference
   */
  $refKey: string | null;
  /**
   * The object that contains a JSON Reference as one of its keys
   */
  $refParent: any;
  $refs: $Refs<S>;
  /**
   * unknown
   */
  indirections: number;
  /**
   * An array of already-inventoried $ref pointers
   */
  inventory: Array<InventoryEntry>;
  /**
   * Fast lookup for inventory entries
   */
  inventoryLookup: ReturnType<typeof createInventoryLookup>;
  options: ParserOptions;
  /**
   * The full path of the JSON Reference at `$refKey`, possibly with a JSON Pointer in the hash
   */
  path: string;
  /**
   * The path of the JSON Reference at `$refKey`, from the schema root
   */
  pathFromRoot: string;
  /**
   * Cache for resolved $ref targets to avoid redundant resolution
   */
  resolvedRefs?: Map<string, any>;
  /**
   * Set of already visited objects to avoid infinite loops and redundant processing
   */
  visitedObjects?: WeakSet<object>;
}) => {
  const $ref = $refKey === null ? $refParent : $refParent[$refKey];
  const $refPath = url.resolve(path, $ref.$ref);

  // Check cache first to avoid redundant resolution
  let pointer = resolvedRefs.get($refPath);
  if (!pointer) {
    try {
      pointer = $refs._resolve($refPath, pathFromRoot, options);
    } catch (error) {
      if (error instanceof MissingPointerError) {
        // Log warning but continue - common in complex schema ecosystems
        console.warn(`Skipping unresolvable $ref: ${$refPath}`);
        return;
      }
      throw error; // Re-throw unexpected errors
    }

    if (pointer) {
      resolvedRefs.set($refPath, pointer);
    }
  }

  if (pointer === null) return;

  const parsed = Pointer.parse(pathFromRoot);
  const depth = parsed.length;
  const file = url.stripHash(pointer.path);
  const hash = url.getHash(pointer.path);
  const external = file !== $refs._root$Ref.path;
  const extended = $Ref.isExtended$Ref($ref);
  indirections += pointer.indirections;

  // Check if this exact location (parent + key + pathFromRoot) has already been inventoried
  const existingEntry = inventoryLookup.find($refParent, $refKey);

  if (existingEntry && existingEntry.pathFromRoot === pathFromRoot) {
    // This exact location has already been inventoried, so we don't need to process it again
    if (depth < existingEntry.depth || indirections < existingEntry.indirections) {
      removeFromInventory(inventory, existingEntry);
      inventoryLookup.remove(existingEntry);
    } else {
      return;
    }
  }

  const newEntry: InventoryEntry = {
    $ref, // The JSON Reference (e.g. {$ref: string})
    circular: pointer.circular, // Is this $ref pointer DIRECTLY circular? (i.e. it references itself)
    depth, // How far from the JSON Schema root is this $ref pointer?
    extended, // Does this $ref extend its resolved value? (i.e. it has extra properties, in addition to "$ref")
    external, // Does this $ref pointer point to a file other than the main JSON Schema file?
    file, // The file that the $ref pointer resolves to
    hash, // The hash within `file` that the $ref pointer resolves to
    indirections, // The number of indirect references that were traversed to resolve the value
    key: $refKey,
    // The resolved value of the $ref pointer
    originalContainerType: external ? getContainerTypeFromPath(pointer.path) : undefined,

    // The key in `parent` that is the $ref pointer
    parent: $refParent,

    // The object that contains this $ref pointer
    pathFromRoot,
    // The path to the $ref pointer, from the JSON Schema root
    value: pointer.value, // The original container type in the external file
  };

  inventory.push(newEntry);
  inventoryLookup.add(newEntry);

  // Recursively crawl the resolved value
  if (!existingEntry || external) {
    crawl({
      $refs,
      indirections: indirections + 1,
      inventory,
      inventoryLookup,
      key: null,
      options,
      parent: pointer.value,
      path: pointer.path,
      pathFromRoot,
      resolvedRefs,
      visitedObjects,
    });
  }
};

/**
 * Recursively crawls the given value, and inventories all JSON references.
 */
const crawl = <S extends object = JSONSchema>({
  $refs,
  indirections,
  inventory,
  inventoryLookup,
  key,
  options,
  parent,
  path,
  pathFromRoot,
  resolvedRefs = new Map(),
  visitedObjects = new WeakSet(),
}: {
  $refs: $Refs<S>;
  indirections: number;
  /**
   * An array of already-inventoried $ref pointers
   */
  inventory: Array<InventoryEntry>;
  /**
   * Fast lookup for inventory entries
   */
  inventoryLookup: ReturnType<typeof createInventoryLookup>;
  /**
   * The property key of `parent` to be crawled
   */
  key: string | null;
  options: ParserOptions;
  /**
   * The object containing the value to crawl. If the value is not an object or array, it will be ignored.
   */
  parent: object | $RefParser;
  /**
   * The full path of the property being crawled, possibly with a JSON Pointer in the hash
   */
  path: string;
  /**
   * The path of the property being crawled, from the schema root
   */
  pathFromRoot: string;
  /**
   * Cache for resolved $ref targets to avoid redundant resolution
   */
  resolvedRefs?: Map<string, any>;
  /**
   * Set of already visited objects to avoid infinite loops and redundant processing
   */
  visitedObjects?: WeakSet<object>;
}) => {
  const obj = key === null ? parent : parent[key as keyof typeof parent];

  if (obj && typeof obj === 'object' && !ArrayBuffer.isView(obj)) {
    // Early exit if we've already processed this exact object
    if (visitedObjects.has(obj)) return;

    if ($Ref.isAllowed$Ref(obj)) {
      inventory$Ref({
        $refKey: key,
        $refParent: parent,
        $refs,
        indirections,
        inventory,
        inventoryLookup,
        options,
        path,
        pathFromRoot,
        resolvedRefs,
        visitedObjects,
      });
    } else {
      // Mark this object as visited BEFORE processing its children
      visitedObjects.add(obj);

      // Crawl the object in a specific order that's optimized for bundling.
      // This is important because it determines how `pathFromRoot` gets built,
      // which later determines which keys get dereferenced and which ones get remapped
      const keys = Object.keys(obj).sort((a, b) => {
        // Most people will expect references to be bundled into the "definitions" property,
        // so we always crawl that property first, if it exists.
        if (a === 'definitions') {
          return -1;
        } else if (b === 'definitions') {
          return 1;
        } else {
          // Otherwise, crawl the keys based on their length.
          // This produces the shortest possible bundled references
          return a.length - b.length;
        }
      }) as Array<keyof typeof obj>;

      for (const key of keys) {
        const keyPath = Pointer.join(path, key);
        const keyPathFromRoot = Pointer.join(pathFromRoot, key);
        const value = obj[key];

        if ($Ref.isAllowed$Ref(value)) {
          inventory$Ref({
            $refKey: key,
            $refParent: obj,
            $refs,
            indirections,
            inventory,
            inventoryLookup,
            options,
            path,
            pathFromRoot: keyPathFromRoot,
            resolvedRefs,
            visitedObjects,
          });
        } else {
          crawl({
            $refs,
            indirections,
            inventory,
            inventoryLookup,
            key,
            options,
            parent: obj,
            path: keyPath,
            pathFromRoot: keyPathFromRoot,
            resolvedRefs,
            visitedObjects,
          });
        }
      }
    }
  }
};

/**
 * Remap external refs by hoisting resolved values into a shared container in the root schema
 * and pointing all occurrences to those internal definitions. Internal refs remain internal.
 */
function remap(parser: $RefParser, inventory: Array<InventoryEntry>) {
  const root = parser.schema as any;

  // Group & sort all the $ref pointers, so they're in the order that we need to dereference/remap them
  inventory.sort((a: InventoryEntry, b: InventoryEntry) => {
    if (a.file !== b.file) {
      // Group all the $refs that point to the same file
      return a.file < b.file ? -1 : +1;
    } else if (a.hash !== b.hash) {
      // Group all the $refs that point to the same part of the file
      return a.hash < b.hash ? -1 : +1;
    } else if (a.circular !== b.circular) {
      // If the $ref points to itself, then sort it higher than other $refs that point to this $ref
      return a.circular ? -1 : +1;
    } else if (a.extended !== b.extended) {
      // If the $ref extends the resolved value, then sort it lower than other $refs that don't extend the value
      return a.extended ? +1 : -1;
    } else if (a.indirections !== b.indirections) {
      // Sort direct references higher than indirect references
      return a.indirections - b.indirections;
    } else if (a.depth !== b.depth) {
      // Sort $refs by how close they are to the JSON Schema root
      return a.depth - b.depth;
    } else {
      // Determine how far each $ref is from the "definitions" property.
      // Most people will expect references to be bundled into the the "definitions" property if possible.
      const aDefinitionsIndex = a.pathFromRoot.lastIndexOf('/definitions');
      const bDefinitionsIndex = b.pathFromRoot.lastIndexOf('/definitions');
      if (aDefinitionsIndex !== bDefinitionsIndex) {
        // Give higher priority to the $ref that's closer to the "definitions" property
        return bDefinitionsIndex - aDefinitionsIndex;
      } else {
        // All else is equal, so use the shorter path, which will produce the shortest possible reference
        return a.pathFromRoot.length - b.pathFromRoot.length;
      }
    }
  });

  // Ensure or return a container by component type. Prefer OpenAPI-aware placement;
  // otherwise use existing root containers; otherwise create components/*.
  const ensureContainer = (
    type: 'schemas' | 'parameters' | 'requestBodies' | 'responses' | 'headers',
  ) => {
    const isOas3 = !!(root && typeof root === 'object' && typeof root.openapi === 'string');
    const isOas2 = !!(root && typeof root === 'object' && typeof root.swagger === 'string');

    if (isOas3) {
      if (!root.components || typeof root.components !== 'object') {
        root.components = {};
      }
      if (!root.components[type] || typeof root.components[type] !== 'object') {
        root.components[type] = {};
      }
      return { obj: root.components[type], prefix: `#/components/${type}` } as const;
    }

    if (isOas2) {
      if (type === 'schemas') {
        if (!root.definitions || typeof root.definitions !== 'object') {
          root.definitions = {};
        }
        return { obj: root.definitions, prefix: '#/definitions' } as const;
      }
      if (type === 'parameters') {
        if (!root.parameters || typeof root.parameters !== 'object') {
          root.parameters = {};
        }
        return { obj: root.parameters, prefix: '#/parameters' } as const;
      }
      if (type === 'responses') {
        if (!root.responses || typeof root.responses !== 'object') {
          root.responses = {};
        }
        return { obj: root.responses, prefix: '#/responses' } as const;
      }
      // requestBodies/headers don't exist as reusable containers in OAS2; fallback to definitions
      if (!root.definitions || typeof root.definitions !== 'object') {
        root.definitions = {};
      }
      return { obj: root.definitions, prefix: '#/definitions' } as const;
    }

    // No explicit version: prefer existing containers
    if (root && typeof root === 'object') {
      if (root.components && typeof root.components === 'object') {
        if (!root.components[type] || typeof root.components[type] !== 'object') {
          root.components[type] = {};
        }
        return { obj: root.components[type], prefix: `#/components/${type}` } as const;
      }
      if (root.definitions && typeof root.definitions === 'object') {
        return { obj: root.definitions, prefix: '#/definitions' } as const;
      }
      // Create components/* by default if nothing exists
      if (!root.components || typeof root.components !== 'object') {
        root.components = {};
      }
      if (!root.components[type] || typeof root.components[type] !== 'object') {
        root.components[type] = {};
      }
      return { obj: root.components[type], prefix: `#/components/${type}` } as const;
    }

    // Fallback
    root.definitions = root.definitions || {};
    return { obj: root.definitions, prefix: '#/definitions' } as const;
  };

  /**
   * Choose the appropriate component container for bundling.
   * Prioritizes the original container type from external files over usage location.
   *
   * @param entry - The inventory entry containing reference information
   * @returns The container type to use for bundling
   */
  const chooseComponent = (entry: InventoryEntry) => {
    // If we have the original container type from the external file, use it
    if (entry.originalContainerType) {
      return entry.originalContainerType;
    }

    // Fallback to usage path for internal references or when original type is not available
    return getContainerTypeFromPath(entry.pathFromRoot);
  };

  // Track names per (container prefix) and per target
  const targetToNameByPrefix = new Map<string, Map<string, string>>();
  const usedNamesByObj = new Map<any, Set<string>>();

  const sanitize = (name: string) => name.replace(/[^A-Za-z0-9_-]/g, '_');
  const baseName = (filePath: string) => {
    try {
      const withoutHash = filePath.split('#')[0]!;
      const parts = withoutHash.split('/');
      const filename = parts[parts.length - 1] || 'schema';
      const dot = filename.lastIndexOf('.');
      return sanitize(dot > 0 ? filename.substring(0, dot) : filename);
    } catch {
      return 'schema';
    }
  };
  const lastToken = (hash: string) => {
    if (!hash || hash === '#') {
      return 'root';
    }
    const tokens = hash.replace(/^#\//, '').split('/');
    return sanitize(tokens[tokens.length - 1] || 'root');
  };
  const uniqueName = (containerObj: any, proposed: string) => {
    if (!usedNamesByObj.has(containerObj)) {
      usedNamesByObj.set(containerObj, new Set<string>(Object.keys(containerObj || {})));
    }
    const used = usedNamesByObj.get(containerObj)!;
    let name = proposed;
    let i = 2;
    while (used.has(name)) {
      name = `${proposed}_${i++}`;
    }
    used.add(name);
    return name;
  };
  for (const entry of inventory) {
    // Safety check: ensure entry and entry.$ref are valid objects
    if (!entry || !entry.$ref || typeof entry.$ref !== 'object') {
      continue;
    }

    // Keep internal refs internal. However, if the $ref extends the resolved value
    // (i.e. it has additional properties in addition to "$ref"), then we must
    // preserve the original $ref rather than rewriting it to the resolved hash.
    if (!entry.external) {
      if (!entry.extended && entry.$ref && typeof entry.$ref === 'object') {
        entry.$ref.$ref = entry.hash;
      }
      continue;
    }

    // Avoid changing direct self-references; keep them internal
    if (entry.circular) {
      if (entry.$ref && typeof entry.$ref === 'object') {
        entry.$ref.$ref = entry.pathFromRoot;
      }
      continue;
    }

    // Choose appropriate container based on original location in external file
    const component = chooseComponent(entry);
    const { obj: container, prefix } = ensureContainer(component);

    const targetKey = `${entry.file}::${entry.hash}`;
    if (!targetToNameByPrefix.has(prefix)) {
      targetToNameByPrefix.set(prefix, new Map<string, string>());
    }
    const namesForPrefix = targetToNameByPrefix.get(prefix)!;

    let defName = namesForPrefix.get(targetKey);
    if (!defName) {
      // If the external file is one of the original input sources, prefer its assigned prefix
      let proposedBase = baseName(entry.file);
      try {
        const parserAny: any = parser as any;
        if (
          parserAny &&
          parserAny.sourcePathToPrefix &&
          typeof parserAny.sourcePathToPrefix.get === 'function'
        ) {
          const withoutHash = (entry.file || '').split('#')[0];
          const mapped = parserAny.sourcePathToPrefix.get(withoutHash);
          if (mapped && typeof mapped === 'string') {
            proposedBase = mapped;
          }
        }
      } catch {
        // Ignore errors
      }
      const proposed = `${proposedBase}_${lastToken(entry.hash)}`;
      defName = uniqueName(container, proposed);
      namesForPrefix.set(targetKey, defName);
      // Store the resolved value under the container
      container[defName] = entry.value;
    }

    // Point the occurrence to the internal definition, preserving extensions
    const refPath = `${prefix}/${defName}`;
    if (entry.extended && entry.$ref && typeof entry.$ref === 'object') {
      entry.$ref.$ref = refPath;
    } else {
      entry.parent[entry.key] = { $ref: refPath };
    }
  }
}

function removeFromInventory(inventory: Array<InventoryEntry>, entry: any) {
  const index = inventory.indexOf(entry);
  inventory.splice(index, 1);
}

/**
 * Bundles all external JSON references into the main JSON schema, thus resulting in a schema that
 * only has *internal* references, not any *external* references.
 * This method mutates the JSON schema object, adding new references and re-mapping existing ones.
 *
 * @param parser
 * @param options
 */
export function bundle(parser: $RefParser, options: ParserOptions): void {
  const inventory: Array<InventoryEntry> = [];
  const inventoryLookup = createInventoryLookup();

  const visitedObjects = new WeakSet<object>();
  const resolvedRefs = new Map<string, any>();

  crawl<JSONSchema>({
    $refs: parser.$refs,
    indirections: 0,
    inventory,
    inventoryLookup,
    key: 'schema',
    options,
    parent: parser,
    path: parser.$refs._root$Ref.path + '#',
    pathFromRoot: '#',
    resolvedRefs,
    visitedObjects,
  });

  remap(parser, inventory);
}

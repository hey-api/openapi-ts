type Slot = 'body' | 'headers' | 'path' | 'query';

export type Field =
  | {
      in: Exclude<Slot, 'body'>;
      key: string;
      map?: string;
    }
  | {
      in: Extract<Slot, 'body'>;
      key?: string;
      map?: string;
    };

export interface Fields {
  allowExtra?: Partial<Record<Slot, boolean>>;
  args?: ReadonlyArray<Field>;
}

export type FieldsConfig = ReadonlyArray<Field | Fields>;

const extraPrefixesMap: Record<string, Slot> = {
  $body_: 'body',
  $headers_: 'headers',
  $path_: 'path',
  $query_: 'query',
};
const extraPrefixes = Object.entries(extraPrefixesMap);

type KeyMap = Map<
  string,
  {
    in: Slot;
    map?: string | undefined;
  }
>;

function buildKeyMap(fields: FieldsConfig, map?: KeyMap): KeyMap {
  if (!map) {
    map = new Map();
  }

  for (const config of fields) {
    if ('in' in config) {
      if (config.key) {
        map.set(config.key, {
          in: config.in,
          map: config.map,
        });
      }
    } else if (config.args) {
      buildKeyMap(config.args, map);
    }
  }

  return map;
}

interface Params {
  body?: unknown;
  headers: Record<string, unknown>;
  path: Record<string, unknown>;
  query: Record<string, unknown>;
}

function stripEmptySlots(params: Params): void {
  for (const [slot, value] of Object.entries(params)) {
    if (slot === 'body') continue;
    if (value && typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length) {
      delete params[slot as Slot];
    }
  }
}

export function buildClientParams(args: ReadonlyArray<unknown>, fields: FieldsConfig): Params {
  const params: Params = {
    headers: Object.create(null),
    path: Object.create(null),
    query: Object.create(null),
  };

  const map = buildKeyMap(fields);

  function writeSlot(slot: Slot, key: string, value: unknown): void {
    let record = params[slot] as Record<string, unknown> | undefined;
    if (record === undefined) {
      record = Object.create(null) as Record<string, unknown>;
      params[slot] = record;
    }
    record[key] = value;
  }

  let config: FieldsConfig[number] | undefined;

  for (const [index, arg] of args.entries()) {
    if (fields[index]) {
      config = fields[index];
    }

    if (!config) {
      continue;
    }

    if ('in' in config) {
      if (config.key) {
        const field = map.get(config.key)!;
        const name = field.map || config.key;
        if (field.in) {
          writeSlot(field.in, name, arg);
        }
      } else {
        params.body = arg;
      }
    } else {
      for (const [key, value] of Object.entries(arg ?? {})) {
        const field = map.get(key);

        if (field) {
          const name = field.map || key;
          writeSlot(field.in, name, value);
        } else {
          const extra = extraPrefixes.find(([prefix]) => key.startsWith(prefix));

          if (extra) {
            const [prefix, slot] = extra;
            writeSlot(slot, key.slice(prefix.length), value);
          } else {
            for (const [slot, allowed] of Object.entries(config.allowExtra ?? {})) {
              if (allowed) {
                writeSlot(slot as Slot, key, value);
                break;
              }
            }
          }
        }
      }
    }
  }

  stripEmptySlots(params);

  return params;
}

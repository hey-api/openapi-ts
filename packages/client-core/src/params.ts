type Slot = 'body' | 'headers' | 'path' | 'query';

type Field =
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

interface Fields {
  allowExtra?: Partial<Record<Slot, boolean>>;
  args?: ReadonlyArray<Field>;
}

export type Config = ReadonlyArray<Field | Fields>;

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
    map?: string;
  }
>;

const buildKeyMap = (configs: Config, map?: KeyMap): KeyMap => {
  if (!map) {
    map = new Map();
  }

  for (const config of configs) {
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
};

interface Params {
  body: unknown;
  headers: Record<string, unknown>;
  path: Record<string, unknown>;
  query: Record<string, unknown>;
}

const stripEmptySlots = (params: Params) => {
  for (const [slot, value] of Object.entries(params)) {
    if (value && typeof value === 'object' && !Object.keys(value).length) {
      delete params[slot as Slot];
    }
  }
};

export const buildClientParams = (
  args: ReadonlyArray<unknown>,
  configs: Config,
) => {
  const params: Params = {
    body: {},
    headers: {},
    path: {},
    query: {},
  };

  const map = buildKeyMap(configs);

  let config: Config[number] | undefined;

  for (const [i, arg] of args.entries()) {
    if (configs[i]) {
      config = configs[i];
    }

    if (!config) {
      continue;
    }

    if ('in' in config) {
      if (config.key) {
        const field = map.get(config.key)!;
        const name = field.map || config.key;
        (params[field.in] as Record<string, unknown>)[name] = arg;
      } else {
        params.body = arg;
      }
    } else {
      for (const [key, value] of Object.entries(arg ?? {})) {
        const field = map.get(key);

        if (field) {
          const name = field.map || key;
          (params[field.in] as Record<string, unknown>)[name] = value;
        } else {
          const extra = extraPrefixes.find(([prefix]) =>
            key.startsWith(prefix),
          );

          if (extra) {
            const [prefix, slot] = extra;
            (params[slot] as Record<string, unknown>)[
              key.slice(prefix.length)
            ] = value;
          } else {
            for (const [slot, allowed] of Object.entries(
              config.allowExtra ?? {},
            )) {
              if (allowed) {
                (params[slot as Slot] as Record<string, unknown>)[key] = value;
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
};

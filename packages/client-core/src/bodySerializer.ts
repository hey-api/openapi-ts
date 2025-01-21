import type {
  ArrayStyle,
  ObjectStyle,
  SerializerOptions,
} from './pathSerializer';

export type BodySerializer = (body: any) => any;

export type QuerySerializer = (query: Record<string, unknown>) => string;

export interface QuerySerializerOptions {
  allowReserved?: boolean;
  array?: SerializerOptions<ArrayStyle>;
  object?: SerializerOptions<ObjectStyle>;
}

const serializeUrlSearchParamsPair = (
  data: URLSearchParams,
  key: string,
  value: unknown,
) => {
  if (typeof value === 'string') {
    data.append(key, value);
  } else {
    data.append(key, JSON.stringify(value));
  }
};

const serializeFormBody = <T>(data: FormData, value: T, key?: string) => {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === 'string' || value instanceof Blob) {
    return data.append(key ?? 'key', value);
  }

  if (typeof value !== 'object') {
    return data.append(key ?? 'key', JSON.stringify(value));
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      serializeFormBody(
        data,
        item,
        key ? `${key}[${index}]` : `array[${index}]`,
      );
    });
    return;
  }

  for (const [k, v] of Object.entries(value)) {
    serializeFormBody(data, v, key ? `${key}[${k}]` : k);
  }
};

export const formDataBodySerializer = {
  bodySerializer: <T>(body: T) => {
    const data = new FormData();
    serializeFormBody(data, body);
    return data;
  },
};

export const jsonBodySerializer = {
  bodySerializer: <T>(body: T) => JSON.stringify(body),
};

export const urlSearchParamsBodySerializer = {
  bodySerializer: <T extends Record<string, any> | Array<Record<string, any>>>(
    body: T,
  ) => {
    const data = new URLSearchParams();

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => serializeUrlSearchParamsPair(data, key, v));
      } else {
        serializeUrlSearchParamsPair(data, key, value);
      }
    });

    return data;
  },
};

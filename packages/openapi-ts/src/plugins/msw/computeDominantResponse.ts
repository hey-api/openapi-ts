import { type IR, statusCodeToGroup } from '@hey-api/shared';

import type { MswPlugin } from './types';

export type ResponseKind = 'binary' | 'json' | 'text' | 'void';

export interface DominantResponse {
  example: unknown;
  kind: ResponseKind;
  statusCode: number | undefined;
}

const isValidExample = (example: unknown): boolean => {
  if (example === undefined) {
    return false;
  }
  if (example === null) {
    return true;
  }
  const type = typeof example;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }
  if (Array.isArray(example)) {
    return example.every(isValidExample);
  }
  if (type === 'object') {
    return Object.values(example as Record<string, unknown>).every(isValidExample);
  }
  return false;
};

const KIND_PRIORITY: Record<ResponseKind, number> = {
  binary: 1,
  json: 3,
  text: 2,
  void: 0,
};

interface ResponseCandidate {
  example: unknown;
  kind: ResponseKind;
  statusCode: number;
}

const computeResponse = ({
  plugin,
  response,
  statusCode,
}: {
  plugin: MswPlugin['Instance'];
  response: IR.ResponseObject;
  statusCode: string;
}): ResponseCandidate => {
  const numericStatus = Number(statusCode);

  if (response.schema.type === 'void') {
    return { example: undefined, kind: 'void', statusCode: numericStatus };
  }

  // In 2.0, empty responses get type 'unknown' (with inherited mediaType from
  // `produces`). A bare 'unknown' without a $ref indicates no real content.
  if (response.schema.type === 'unknown' && !response.schema.$ref) {
    return { example: undefined, kind: 'void', statusCode: numericStatus };
  }

  let schema = response.schema;
  if (schema.$ref) {
    schema = plugin.context.resolveIrRef<IR.SchemaObject>(schema.$ref);
  }

  const example = isValidExample(schema.example) ? schema.example : undefined;

  if (schema.format === 'binary') {
    return { example, kind: 'binary', statusCode: numericStatus };
  }

  const kind = mediaTypeToKind(response.mediaType);
  return { example, kind, statusCode: numericStatus };
};

const mediaTypeToKind = (mediaType: string | undefined): ResponseKind => {
  if (!mediaType) {
    return 'json';
  }

  const cleanMediaType = mediaType.split(';')[0]?.trim() ?? '';

  if (
    cleanMediaType.startsWith('application/octet-stream') ||
    cleanMediaType.startsWith('audio/') ||
    cleanMediaType.startsWith('image/') ||
    cleanMediaType.startsWith('video/')
  ) {
    return 'binary';
  }

  if (cleanMediaType.startsWith('application/json') || cleanMediaType.endsWith('+json')) {
    return 'json';
  }

  if (cleanMediaType.startsWith('text/')) {
    return 'text';
  }

  // unknown media type, default to json
  return 'json';
};

export const computeDominantResponse = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: MswPlugin['Instance'];
}): DominantResponse => {
  const candidates: Array<ResponseCandidate> = [];

  for (const statusCode in operation.responses) {
    if (statusCodeToGroup({ statusCode }) !== '2XX') {
      continue;
    }
    candidates.push(
      computeResponse({
        plugin,
        response: operation.responses[statusCode]!,
        statusCode,
      }),
    );
  }

  if (candidates.length === 0) {
    return { example: undefined, kind: 'void', statusCode: undefined };
  }

  const dominant = candidates.reduce((best, cur) =>
    KIND_PRIORITY[cur.kind] > KIND_PRIORITY[best.kind] ? cur : best,
  );

  return {
    example: dominant.example,
    kind: dominant.kind,
    statusCode: dominant.statusCode,
  };
};

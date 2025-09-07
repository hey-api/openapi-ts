import { describe, expect, it } from 'vitest';

import { getValidRequestBody } from '../../client-core/bundle/utils';

describe('getValidRequestBody', () => {
  const noBodySerializer = [
    { body: '' },
    { body: 0 },
    { body: false },
    { body: 'test string' },
    { body: null },
    { body: undefined },
  ].map(({ body }) => ({
    expectedBody: body,
    options: { body, bodySerializer: null, serializedBody: 'ignore' },
  }));

  const hasBodySerializer = [
    { body: '', expectedBody: null },
    { body: 0, expectedBody: 0 },
    { body: false, expectedBody: false },
    { body: '{"key":"value"}', expectedBody: '{"key":"value"}' },
    { body: null, expectedBody: null },
    { body: undefined, expectedBody: undefined },
  ].map(({ body, expectedBody }) => ({
    expectedBody,
    options: { body, bodySerializer: () => {} },
  }));

  const hasBodySerializerAndSerializedBodyProperty = [
    { body: '', expectedBody: null, serializedBody: '' },
    { body: 0, expectedBody: 0, serializedBody: 0 },
    { body: false, expectedBody: false, serializedBody: false },
    {
      body: {},
      expectedBody: '{"key":"value"}',
      serializedBody: '{"key":"value"}',
    },
    { body: null, expectedBody: 'foo', serializedBody: 'foo' },
    { body: undefined, expectedBody: undefined, serializedBody: undefined },
  ].map(({ body, expectedBody, serializedBody }) => ({
    expectedBody,
    options: { body, bodySerializer: () => {}, serializedBody },
  }));

  it.each(noBodySerializer)(
    'returns $expectedBody when unserialized body value is $options.body',
    ({ expectedBody, options }) => {
      expect(getValidRequestBody(options)).toBe(expectedBody);
    },
  );

  it.each(hasBodySerializer)(
    'evaluates body and returns $expectedBody when serialized value is $options.body',
    ({ expectedBody, options }) => {
      expect(getValidRequestBody(options)).toBe(expectedBody);
    },
  );

  it.each(hasBodySerializerAndSerializedBodyProperty)(
    'evaluates serializedBody and returns $expectedBody when value is $options.serializedBody',
    ({ expectedBody, options }) => {
      expect(getValidRequestBody(options)).toBe(expectedBody);
    },
  );
});

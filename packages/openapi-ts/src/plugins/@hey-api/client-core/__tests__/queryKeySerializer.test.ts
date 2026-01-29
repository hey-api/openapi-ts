import {
  queryKeyJsonReplacer,
  serializeQueryKeyValue,
  stringifyToJsonValue,
} from '../bundle/queryKeySerializer';

describe('query key helpers', () => {
  describe('queryKeyJsonReplacer', () => {
    it('converts bigint to string', () => {
      expect(queryKeyJsonReplacer('value', 1n)).toBe('1');
    });

    it('converts Date to ISO string', () => {
      const date = new Date('2025-01-01T12:34:56.000Z');
      expect(queryKeyJsonReplacer('value', date)).toBe(date.toISOString());
    });

    it('drops unsupported values', () => {
      expect(queryKeyJsonReplacer('value', undefined)).toBeUndefined();
      expect(queryKeyJsonReplacer('value', () => {})).toBeUndefined();
      expect(queryKeyJsonReplacer('value', Symbol('s'))).toBeUndefined();
    });
  });

  describe('stringifyToJsonValue', () => {
    it('produces JSON-safe structures', () => {
      const input = {
        a: 1n,
        b: new Date('2025-01-02T00:00:00.000Z'),
        c: () => {},
        d: undefined,
      };

      expect(stringifyToJsonValue(input)).toEqual({
        a: '1',
        b: '2025-01-02T00:00:00.000Z',
      });
    });

    it('returns undefined when value cannot be stringified', () => {
      const circular: { self?: unknown } = {};
      circular.self = circular;

      expect(stringifyToJsonValue(circular)).toBeUndefined();
    });
  });

  describe('serializeQueryKeyValue', () => {
    it('handles primitives and null', () => {
      expect(serializeQueryKeyValue(null)).toBeNull();
      expect(serializeQueryKeyValue('')).toBe('');
      expect(serializeQueryKeyValue(0)).toBe(0);
      expect(serializeQueryKeyValue(false)).toBe(false);
    });

    it('converts special primitives', () => {
      expect(serializeQueryKeyValue(1n)).toBe('1');

      const date = new Date('2025-03-04T05:06:07.000Z');
      expect(serializeQueryKeyValue(date)).toBe(date.toISOString());
    });

    it('normalizes arrays', () => {
      const date = new Date('2025-03-04T05:06:07.000Z');
      expect(serializeQueryKeyValue([1n, date, undefined, () => {}, 'ok'])).toEqual([
        '1',
        date.toISOString(),
        null,
        null,
        'ok',
      ]);
    });

    it('normalizes plain objects', () => {
      const result = serializeQueryKeyValue({
        a: 1,
        b: 1n,
        c: new Date('2025-06-07T08:09:10.000Z'),
        d: undefined,
        e: () => {},
      });

      expect(result).toEqual({
        a: 1,
        b: '1',
        c: '2025-06-07T08:09:10.000Z',
      });
    });

    it('supports objects with null prototype', () => {
      const value = Object.assign(Object.create(null), { a: 1 });
      expect(serializeQueryKeyValue(value)).toEqual({ a: 1 });
    });

    it('serializes URLSearchParams as JSON object', () => {
      const params = new URLSearchParams();
      params.append('a', '1');
      params.append('a', '2');
      params.append('b', 'foo');

      expect(serializeQueryKeyValue(params)).toEqual({
        a: ['1', '2'],
        b: 'foo',
      });
    });

    it('rejects unsupported structures', () => {
      expect(serializeQueryKeyValue(new Map())).toBeUndefined();
      expect(serializeQueryKeyValue(new Set())).toBeUndefined();
      expect(serializeQueryKeyValue(new (class Example {})())).toBeUndefined();
    });
  });
});

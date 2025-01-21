import { describe, expect, it } from 'vitest';

import { formDataBodySerializer } from '../bodySerializer';

describe('formDataBodySerializer', () => {
  const { bodySerializer } = formDataBodySerializer;

  it('object with primitive values', async () => {
    const data = bodySerializer({
      bar: 1,
      baz: true,
      foo: 'bar',
    });
    expect(data.get('foo')).toBe('bar');
    expect(data.get('bar')).toBe('1');
    expect(data.get('baz')).toBe('true');
  });

  it('array with primitive values', async () => {
    const data = bodySerializer([1, true, 'bar']);
    expect(data.get('array[0]')).toBe('1');
    expect(data.get('array[1]')).toBe('true');
    expect(data.get('array[2]')).toBe('bar');
  });

  it('primitive value', async () => {
    const data = bodySerializer(1);
    expect(data.get('key')).toBe('1');
  });

  it('nested array with primitive values', async () => {
    const data = bodySerializer({
      foo: [[1, true, 'bar']],
    });
    expect(data.get('foo[0][0]')).toBe('1');
    expect(data.get('foo[0][1]')).toBe('true');
    expect(data.get('foo[0][2]')).toBe('bar');
  });

  it('nested object with primitive values', async () => {
    const data = bodySerializer({
      foo: {
        bar: {
          bar: 1,
          baz: true,
          foo: 'bar',
        },
      },
    });
    expect(data.get('foo[bar][foo]')).toBe('bar');
    expect(data.get('foo[bar][bar]')).toBe('1');
    expect(data.get('foo[bar][baz]')).toBe('true');
  });
});

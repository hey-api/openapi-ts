import { formDataBodySerializer } from '../bundle/bodySerializer';

describe('formDataBodySerializer', () => {
  it('serializes number', () => {
    const body = { a: 1 };
    const formData = formDataBodySerializer.bodySerializer(body);
    expect(formData.get('a')).toBe('1');
  });

  it('serializes string', () => {
    const body = { a: 'foo' };
    const formData = formDataBodySerializer.bodySerializer(body);
    expect(formData.get('a')).toBe('foo');
  });

  it('serializes date', () => {
    const body = { a: new Date('2025-01-01T00:00:00.000Z') };
    const formData = formDataBodySerializer.bodySerializer(body);
    expect(formData.get('a')).toBe('2025-01-01T00:00:00.000Z');
  });
});

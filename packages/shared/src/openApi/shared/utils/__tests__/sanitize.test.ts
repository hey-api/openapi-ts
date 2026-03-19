import { sanitizeNamespaceIdentifier } from '../operation';

describe('sanitizeNamespaceIdentifier', () => {
  it.each([
    { expected: 'abc', input: 'abc' },
    { expected: 'æbc', input: 'æbc' },
    { expected: 'æb-c', input: 'æb.c' },
    { expected: 'æb-c', input: '1æb.c' },
    { expected: 'a-b-c--d---e', input: 'a/b{c}/d/$+e' },
  ])('sanitizeNamespaceIdentifier($input) -> $expected', ({ expected, input }) => {
    expect(sanitizeNamespaceIdentifier(input)).toEqual(expected);
  });
});

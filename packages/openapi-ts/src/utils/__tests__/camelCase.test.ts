import { describe, expect, it } from 'vitest';

import { camelCase } from '../camelCase';

const toCheck: { input: string; output: string }[] = [
  { input: 'fooDTOById', output: 'fooDtoById' },
  { input: 'fooDTOs', output: 'fooDtos' },
  { input: 'fooDTOsById', output: 'fooDtosById' },
  { input: 'DTOById', output: 'dtoById' },
  { input: 'DTOs', output: 'dtos' },
  { input: 'DTOsById', output: 'dtosById' },
  { input: 'SOME_JSON_FILE', output: 'someJsonFile' },
  { input: 'SOME_JSONs_FILE', output: 'someJsonsFile' },
  { input: 'postHTMLGuide', output: 'postHtmlGuide' },
  { input: 'postHTMLScale', output: 'postHtmlScale' },
];

describe('camelCase', () => {
  it.each(toCheck)('transforms $input to $output', ({ input, output }) => {
    expect(camelCase({ input })).toBe(output);
  });
});

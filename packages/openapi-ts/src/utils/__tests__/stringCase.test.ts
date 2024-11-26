import { describe, expect, it } from 'vitest';

import { stringCase } from '../stringCase';

const cases = ['camelCase', 'PascalCase', 'snake_case'] as const;

const scenarios: ReadonlyArray<{
  PascalCase: string;
  camelCase: string;
  input: string;
  snake_case: string;
}> = [
  {
    PascalCase: 'FooDtoById',
    camelCase: 'fooDtoById',
    input: 'fooDTOById',
    snake_case: 'foo_dto_by_id',
  },
  {
    PascalCase: 'FooDtos',
    camelCase: 'fooDtos',
    input: 'fooDTOs',
    snake_case: 'foo_dtos',
  },
  {
    PascalCase: 'FooDtosById',
    camelCase: 'fooDtosById',
    input: 'fooDTOsById',
    snake_case: 'foo_dtos_by_id',
  },
  {
    PascalCase: 'DtoById',
    camelCase: 'dtoById',
    input: 'DTOById',
    snake_case: 'dto_by_id',
  },
  {
    PascalCase: 'Dtos',
    camelCase: 'dtos',
    input: 'DTOs',
    snake_case: 'dtos',
  },
  {
    PascalCase: 'DtosById',
    camelCase: 'dtosById',
    input: 'DTOsById',
    snake_case: 'dtos_by_id',
  },
  {
    PascalCase: 'SomeJsonFile',
    camelCase: 'someJsonFile',
    input: 'SOME_JSON_FILE',
    snake_case: 'some_json_file',
  },
  {
    PascalCase: 'SomeJsonsFile',
    camelCase: 'someJsonsFile',
    input: 'SOME_JSONs_FILE',
    snake_case: 'some_jsons_file',
  },
  {
    PascalCase: 'PostHtmlGuide',
    camelCase: 'postHtmlGuide',
    input: 'postHTMLGuide',
    snake_case: 'post_html_guide',
  },
  {
    PascalCase: 'PostHtmlScale',
    camelCase: 'postHtmlScale',
    input: 'postHTMLScale',
    snake_case: 'post_html_scale',
  },
  {
    PascalCase: 'SnakeCase',
    camelCase: 'snakeCase',
    input: 'snake_case',
    snake_case: 'snake_case',
  },
  {
    PascalCase: 'CamelCase',
    camelCase: 'camelCase',
    input: 'camelCase',
    snake_case: 'camel_case',
  },
  {
    PascalCase: 'PascalCase',
    camelCase: 'pascalCase',
    input: 'PascalCase',
    snake_case: 'pascal_case',
  },
];

describe('stringCase', () => {
  describe.each(cases)('%s', (style) => {
    switch (style) {
      case 'PascalCase':
        it.each(scenarios)('$input -> $PascalCase', ({ PascalCase, input }) => {
          expect(stringCase({ input, style })).toBe(PascalCase);
        });
        break;
      case 'camelCase':
        it.each(scenarios)('$input -> $camelCase', ({ camelCase, input }) => {
          expect(stringCase({ input, style })).toBe(camelCase);
        });
        break;
      case 'snake_case':
        it.each(scenarios)('$input -> $snake_case', ({ input, snake_case }) => {
          expect(stringCase({ input, style })).toBe(snake_case);
        });
        break;
    }
  });
});

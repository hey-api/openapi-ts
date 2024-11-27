import { describe, expect, it } from 'vitest';

import { stringCase } from '../stringCase';

const cases = ['camelCase', 'PascalCase', 'snake_case'] as const;

const scenarios: ReadonlyArray<{
  PascalCase: string;
  camelCase: string;
  snake_case: string;
  value: string;
}> = [
  {
    PascalCase: 'FooDtoById',
    camelCase: 'fooDtoById',
    snake_case: 'foo_dto_by_id',
    value: 'fooDTOById',
  },
  {
    PascalCase: 'FooDtos',
    camelCase: 'fooDtos',
    snake_case: 'foo_dtos',
    value: 'fooDTOs',
  },
  {
    PascalCase: 'FooDtosById',
    camelCase: 'fooDtosById',
    snake_case: 'foo_dtos_by_id',
    value: 'fooDTOsById',
  },
  {
    PascalCase: 'DtoById',
    camelCase: 'dtoById',
    snake_case: 'dto_by_id',
    value: 'DTOById',
  },
  {
    PascalCase: 'Dtos',
    camelCase: 'dtos',
    snake_case: 'dtos',
    value: 'DTOs',
  },
  {
    PascalCase: 'DtosById',
    camelCase: 'dtosById',
    snake_case: 'dtos_by_id',
    value: 'DTOsById',
  },
  {
    PascalCase: 'SomeJsonFile',
    camelCase: 'someJsonFile',
    snake_case: 'some_json_file',
    value: 'SOME_JSON_FILE',
  },
  {
    PascalCase: 'SomeJsonsFile',
    camelCase: 'someJsonsFile',
    snake_case: 'some_jsons_file',
    value: 'SOME_JSONs_FILE',
  },
  {
    PascalCase: 'PostHtmlGuide',
    camelCase: 'postHtmlGuide',
    snake_case: 'post_html_guide',
    value: 'postHTMLGuide',
  },
  {
    PascalCase: 'PostHtmlScale',
    camelCase: 'postHtmlScale',
    snake_case: 'post_html_scale',
    value: 'postHTMLScale',
  },
  {
    PascalCase: 'SnakeCase',
    camelCase: 'snakeCase',
    snake_case: 'snake_case',
    value: 'snake_case',
  },
  {
    PascalCase: 'CamelCase',
    camelCase: 'camelCase',
    snake_case: 'camel_case',
    value: 'camelCase',
  },
  {
    PascalCase: 'PascalCase',
    camelCase: 'pascalCase',
    snake_case: 'pascal_case',
    value: 'PascalCase',
  },
  {
    PascalCase: 'IsXRated',
    camelCase: 'isXRated',
    snake_case: 'is_x_rated',
    value: 'isXRated',
  },
  {
    PascalCase: 'IsHtmlSafe',
    camelCase: 'isHtmlSafe',
    snake_case: 'is_html_safe',
    value: 'isHTMLSafe',
  },
  {
    PascalCase: 'MyAspirations',
    camelCase: 'myAspirations',
    snake_case: 'my_aspirations',
    value: 'MyAspirations',
  },
  {
    PascalCase: 'IoK8sApimachineryPkgApisMetaV1DeleteOptions',
    camelCase: 'ioK8sApimachineryPkgApisMetaV1DeleteOptions',
    snake_case: 'io_k8s_apimachinery_pkg_apis_meta_v1_delete_options',
    value: 'io.k8sApimachinery.pkg.apis.meta.v1.DeleteOptions',
  },
  {
    PascalCase: 'GenericSchemaDuplicateIssue1SystemBoolean',
    camelCase: 'genericSchemaDuplicateIssue1SystemBoolean',
    snake_case: 'generic_schema_duplicate_issue_1_system_boolean',
    value: 'Generic.Schema.Duplicate.Issue`1[System.Boolean]',
  },
  {
    PascalCase: 'GetApiVApiVersionUsersUserIdLocationLocationId',
    camelCase: 'getApiVApiVersionUsersUserIdLocationLocationId',
    snake_case: 'get_api_v_api_version_users_user_id_location_location_id',
    value: 'GET /api/v{api-version}/users/{userId}/location/{locationId}',
  },
  {
    PascalCase: 'IPhoneS',
    camelCase: 'iPhoneS',
    snake_case: 'i_phone_s',
    value: 'iPhone S',
  },
];

describe('stringCase', () => {
  describe.each(cases)('%s', (style) => {
    switch (style) {
      case 'PascalCase':
        it.each(scenarios)('$value -> $PascalCase', ({ PascalCase, value }) => {
          expect(stringCase({ case: style, value })).toBe(PascalCase);
        });
        break;
      case 'camelCase':
        it.each(scenarios)('$value -> $camelCase', ({ camelCase, value }) => {
          expect(stringCase({ case: style, value })).toBe(camelCase);
        });
        break;
      case 'snake_case':
        it.each(scenarios)('$value -> $snake_case', ({ snake_case, value }) => {
          expect(stringCase({ case: style, value })).toBe(snake_case);
        });
        break;
    }
  });
});

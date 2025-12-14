import { describe, expect, it } from 'vitest';

import type { StringCase } from '~/types/case';

import { stringCase } from '../stringCase';

const cases: ReadonlyArray<StringCase> = [
  'camelCase',
  'PascalCase',
  'SCREAMING_SNAKE_CASE',
  'snake_case',
];

const scenarios: ReadonlyArray<{
  PascalCase: string;
  SCREAMING_SNAKE_CASE: string;
  camelCase: string;
  snake_case: string;
  stripLeadingSeparators?: boolean;
  value: string;
}> = [
  {
    PascalCase: 'FooDtoById',
    SCREAMING_SNAKE_CASE: 'FOO_DTO_BY_ID',
    camelCase: 'fooDtoById',
    snake_case: 'foo_dto_by_id',
    value: 'fooDTOById',
  },
  {
    PascalCase: 'FooDtos',
    SCREAMING_SNAKE_CASE: 'FOO_DTOS',
    camelCase: 'fooDtos',
    snake_case: 'foo_dtos',
    value: 'fooDTOs',
  },
  {
    PascalCase: 'FooDtosById',
    SCREAMING_SNAKE_CASE: 'FOO_DTOS_BY_ID',
    camelCase: 'fooDtosById',
    snake_case: 'foo_dtos_by_id',
    value: 'fooDTOsById',
  },
  {
    PascalCase: 'DtoById',
    SCREAMING_SNAKE_CASE: 'DTO_BY_ID',
    camelCase: 'dtoById',
    snake_case: 'dto_by_id',
    value: 'DTOById',
  },
  {
    PascalCase: 'Dtos',
    SCREAMING_SNAKE_CASE: 'DTOS',
    camelCase: 'dtos',
    snake_case: 'dtos',
    value: 'DTOs',
  },
  {
    PascalCase: 'DtosById',
    SCREAMING_SNAKE_CASE: 'DTOS_BY_ID',
    camelCase: 'dtosById',
    snake_case: 'dtos_by_id',
    value: 'DTOsById',
  },
  {
    PascalCase: 'SomeJsonFile',
    SCREAMING_SNAKE_CASE: 'SOME_JSON_FILE',
    camelCase: 'someJsonFile',
    snake_case: 'some_json_file',
    value: 'SOME_JSON_FILE',
  },
  {
    PascalCase: 'SomeJsonsFile',
    SCREAMING_SNAKE_CASE: 'SOME_JSONS_FILE',
    camelCase: 'someJsonsFile',
    snake_case: 'some_jsons_file',
    value: 'SOME_JSONs_FILE',
  },
  {
    PascalCase: 'PostHtmlGuide',
    SCREAMING_SNAKE_CASE: 'POST_HTML_GUIDE',
    camelCase: 'postHtmlGuide',
    snake_case: 'post_html_guide',
    value: 'postHTMLGuide',
  },
  {
    PascalCase: 'PostHtmlScale',
    SCREAMING_SNAKE_CASE: 'POST_HTML_SCALE',
    camelCase: 'postHtmlScale',
    snake_case: 'post_html_scale',
    value: 'postHTMLScale',
  },
  {
    PascalCase: 'SnakeCase',
    SCREAMING_SNAKE_CASE: 'SNAKE_CASE',
    camelCase: 'snakeCase',
    snake_case: 'snake_case',
    value: 'snake_case',
  },
  {
    PascalCase: 'CamelCase',
    SCREAMING_SNAKE_CASE: 'CAMEL_CASE',
    camelCase: 'camelCase',
    snake_case: 'camel_case',
    value: 'camelCase',
  },
  {
    PascalCase: 'PascalCase',
    SCREAMING_SNAKE_CASE: 'PASCAL_CASE',
    camelCase: 'pascalCase',
    snake_case: 'pascal_case',
    value: 'PascalCase',
  },
  {
    PascalCase: 'IsXRated',
    SCREAMING_SNAKE_CASE: 'IS_X_RATED',
    camelCase: 'isXRated',
    snake_case: 'is_x_rated',
    value: 'isXRated',
  },
  {
    PascalCase: 'IsHtmlSafe',
    SCREAMING_SNAKE_CASE: 'IS_HTML_SAFE',
    camelCase: 'isHtmlSafe',
    snake_case: 'is_html_safe',
    value: 'isHTMLSafe',
  },
  {
    PascalCase: 'MyAspirations',
    SCREAMING_SNAKE_CASE: 'MY_ASPIRATIONS',
    camelCase: 'myAspirations',
    snake_case: 'my_aspirations',
    value: 'MyAspirations',
  },
  {
    PascalCase: 'IoK8sApimachineryPkgApisMetaV1DeleteOptions',
    SCREAMING_SNAKE_CASE: 'IO_K8S_APIMACHINERY_PKG_APIS_META_V1_DELETE_OPTIONS',
    camelCase: 'ioK8sApimachineryPkgApisMetaV1DeleteOptions',
    snake_case: 'io_k8s_apimachinery_pkg_apis_meta_v1_delete_options',
    value: 'io.k8sApimachinery.pkg.apis.meta:v1.DeleteOptions',
  },
  {
    PascalCase: 'GenericSchemaDuplicateIssue1SystemBoolean',
    SCREAMING_SNAKE_CASE: 'GENERIC_SCHEMA_DUPLICATE_ISSUE_1_SYSTEM_BOOLEAN',
    camelCase: 'genericSchemaDuplicateIssue1SystemBoolean',
    snake_case: 'generic_schema_duplicate_issue_1_system_boolean',
    value: 'Generic.Schema.Duplicate.Issue`1[System.Boolean]',
  },
  {
    PascalCase: 'GetApiVApiVersionUsersUserIdLocationLocationId',
    SCREAMING_SNAKE_CASE:
      'GET_API_V_API_VERSION_USERS_USER_ID_LOCATION_LOCATION_ID',
    camelCase: 'getApiVApiVersionUsersUserIdLocationLocationId',
    snake_case: 'get_api_v_api_version_users_user_id_location_location_id',
    value: 'GET /api/v{api-version}/users/{userId}/location/{locationId}',
  },
  {
    PascalCase: 'IPhoneS',
    SCREAMING_SNAKE_CASE: 'I_PHONE_S',
    camelCase: 'iPhoneS',
    snake_case: 'i_phone_s',
    value: 'iPhone S',
  },
  {
    PascalCase: '-100',
    SCREAMING_SNAKE_CASE: '-100',
    camelCase: '-100',
    snake_case: '-100',
    stripLeadingSeparators: false,
    value: '-100',
  },
  {
    PascalCase: 'MyFoo',
    SCREAMING_SNAKE_CASE: 'MY_FOO',
    camelCase: 'myFoo',
    snake_case: 'my_foo',
    stripLeadingSeparators: false,
    value: 'MyFoo',
  },
];

describe('stringCase', () => {
  describe.each(cases)('%s', (style) => {
    switch (style) {
      case 'PascalCase':
        it.each(scenarios)(
          '$value -> $PascalCase',
          ({ PascalCase, stripLeadingSeparators, value }) => {
            expect(
              stringCase({ case: style, stripLeadingSeparators, value }),
            ).toBe(PascalCase);
          },
        );
        break;
      case 'camelCase':
        it.each(scenarios)(
          '$value -> $camelCase',
          ({ camelCase, stripLeadingSeparators, value }) => {
            expect(
              stringCase({ case: style, stripLeadingSeparators, value }),
            ).toBe(camelCase);
          },
        );
        break;
      case 'SCREAMING_SNAKE_CASE':
        it.each(scenarios)(
          '$value -> $SCREAMING_SNAKE_CASE',
          ({ SCREAMING_SNAKE_CASE, stripLeadingSeparators, value }) => {
            expect(
              stringCase({ case: style, stripLeadingSeparators, value }),
            ).toBe(SCREAMING_SNAKE_CASE);
          },
        );
        break;
      case 'snake_case':
        it.each(scenarios)(
          '$value -> $snake_case',
          ({ snake_case, stripLeadingSeparators, value }) => {
            expect(
              stringCase({ case: style, stripLeadingSeparators, value }),
            ).toBe(snake_case);
          },
        );
        break;
    }
  });
});

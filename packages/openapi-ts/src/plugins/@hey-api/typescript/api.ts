import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';

import { irSchemaToAstV1 } from './v1/api';

export type IApi = {
  schemaToType: (
    args: Parameters<typeof irSchemaToAstV1>[0],
  ) => MaybeTsDsl<TypeTsDsl>;
};

export class Api implements IApi {
  schemaToType(
    args: Parameters<typeof irSchemaToAstV1>[0],
  ): MaybeTsDsl<TypeTsDsl> {
    return irSchemaToAstV1(args);
  }
}

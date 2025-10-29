import type ts from 'typescript';

import { irSchemaToAstV1 } from './v1/api';

export type IApi = {
  schemaToType: (args: Parameters<typeof irSchemaToAstV1>[0]) => ts.TypeNode;
};

export class Api implements IApi {
  schemaToType(args: Parameters<typeof irSchemaToAstV1>[0]): ts.TypeNode {
    return irSchemaToAstV1(args);
  }
}

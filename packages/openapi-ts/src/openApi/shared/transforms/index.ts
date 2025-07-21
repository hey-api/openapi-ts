import type { IR } from '../../../ir/types';
import { enumsTransform } from './enums';
import { readWriteTransform } from './readWrite';

export const transformOpenApiSpec = ({ context }: { context: IR.Context }) => {
  if (context.config.parser.transforms.enums.enabled) {
    enumsTransform({
      config: context.config.parser.transforms.enums,
      spec: context.spec,
    });
  }

  if (context.config.parser.transforms.readWrite.enabled) {
    readWriteTransform({
      config: context.config.parser.transforms.readWrite,
      spec: context.spec,
    });
  }
};

import type { Context } from '../../../ir/context';
import { enumsTransform } from './enums';
import { propertiesRequiredByDefaultTransform } from './propertiesRequiredByDefault';
import { readWriteTransform } from './readWrite';

export const transformOpenApiSpec = ({ context }: { context: Context }) => {
  const { logger } = context;
  const eventTransformOpenApiSpec = logger.timeEvent('transform-openapi-spec');
  if (context.config.parser.transforms.enums.enabled) {
    enumsTransform({
      config: context.config.parser.transforms.enums,
      spec: context.spec,
    });
  }

  if (context.config.parser.transforms.propertiesRequiredByDefault) {
    propertiesRequiredByDefaultTransform({ spec: context.spec });
  }

  if (context.config.parser.transforms.readWrite.enabled) {
    readWriteTransform({
      config: context.config.parser.transforms.readWrite,
      logger,
      spec: context.spec,
    });
  }
  eventTransformOpenApiSpec.timeEnd();
};

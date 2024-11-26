import ts from 'typescript';

import type { IRContext } from '../../../ir/context';
import { stringCase } from '../../../utils/stringCase';

const digitsRegExp = /^\d+$/;

/**
 * Returns final field name for object properties. This might differ from the
 * original value as applying case transform function might alter it.
 */
export const fieldName = ({
  context,
  name,
}: {
  context: IRContext;
  name: string;
}) => {
  digitsRegExp.lastIndex = 0;
  if (digitsRegExp.test(name)) {
    return ts.factory.createNumericLiteral(name);
  }

  if (!context.config.output.case) {
    return name;
  }

  if (typeof context.config.output.case === 'function') {
    // TODO: parser - pass arguments
    return context.config.output.case();
  }

  return stringCase({ input: name, style: context.config.output.case });
};

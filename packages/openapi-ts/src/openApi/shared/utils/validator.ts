import * as colors from 'ansi-colors';

import type { IR } from '../../../ir/types';

export interface ValidatorError {
  /**
   * Machine-readable error code
   *
   * @example
   * 'invalid_type'
   */
  code: 'invalid_type' | 'missing_required_field';
  /**
   * Optional additional data.
   *
   * @example
   * 'expectedType'
   */
  context?: Record<string, any>;
  /**
   * Human-readable error summary.
   */
  message: string;
  /**
   * JSONPath-like array to pinpoint error location.
   */
  path: ReadonlyArray<string | number>;
  /**
   * Error severity.
   */
  severity: 'error' | 'warning';
}

export interface ValidatorResult {
  errors: ReadonlyArray<ValidatorError>;
  valid: boolean;
}

const formatValidatorError = (error: ValidatorError): string => {
  const pathStr = error.path
    .map((segment) => (typeof segment === 'number' ? `[${segment}]` : segment))
    .join('')
    .replace(/\.\[/g, '[');
  const level =
    error.severity === 'error' ? colors.bold.red : colors.bold.yellow;

  const highlightedMessage = error.message.replace(/`([^`]+)`/g, (_, code) =>
    colors.yellow(`\`${code}\``),
  );

  return `${level(`[${error.severity.toUpperCase()}]`)} ${colors.cyan(pathStr)}: ${highlightedMessage}`;
};

export const handleValidatorResult = ({
  context,
  result,
}: {
  context: IR.Context;
  result: ValidatorResult;
}) => {
  if (!context.config.input.validate_EXPERIMENTAL || result.valid) {
    return;
  }

  for (const error of result.errors) {
    console.log(formatValidatorError(error));
  }

  process.exit(1);
};

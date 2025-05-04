import type { Config, StringCase } from '../../../types/config';
import { irRef } from '../../../utils/ref';
import { stringCase } from '../../../utils/stringCase';

interface OperationIRRef {
  /**
   * Operation ID
   */
  id: string;
}

export const operationIrRef = ({
  case: _case = 'PascalCase',
  config,
  id,
  type,
}: OperationIRRef & {
  readonly case?: StringCase;
  config: Pick<Config, 'plugins'>;
  type: 'data' | 'error' | 'errors' | 'response' | 'responses';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
    case 'error': // error union
    case 'errors': // errors map
    case 'response': // response union
    case 'responses': // responses map
      affix = `${(type[0] ?? '').toLocaleUpperCase()}${type.slice(1)}`;
      break;
  }
  let separator = true;
  if (config.plugins['@hey-api/typescript']?.identifierCase === 'preserve') {
    separator = false;
  }
  return `${irRef}${stringCase({
    case: _case,
    value: id,
  })}${separator ? '-' : ''}${affix}`;
};

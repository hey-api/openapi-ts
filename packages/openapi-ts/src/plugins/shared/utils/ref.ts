import type { StringCase } from '../../../types/case';
import type { Config } from '../../../types/config';
import { irRef } from '../../../utils/ref';
import { stringCase } from '../../../utils/stringCase';

interface OperationIRRef {
  /**
   * Operation ID
   */
  id: string;
}

// TODO: this needs refactor
export const operationIrRef = ({
  case: _case = 'PascalCase',
  config,
  id,
  parameterId,
  type,
}: OperationIRRef & {
  readonly case?: StringCase;
  config: Pick<Config, 'plugins'>;
  parameterId?: string;
  type: 'data' | 'error' | 'errors' | 'parameter' | 'response' | 'responses';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
    case 'error': // error union
    case 'errors': // errors map
    case 'parameter':
    case 'response': // response union
    case 'responses': // responses map
      affix = `${(type[0] ?? '').toLocaleUpperCase()}${type.slice(1)}`;
      break;
  }
  let separate = true;
  if (
    config.plugins['@hey-api/typescript']?.config.identifierCase === 'preserve'
  ) {
    separate = false;
  }
  const separator = separate ? '-' : '';
  const parts: Array<string> = [
    irRef,
    stringCase({
      case: _case,
      value: id,
    }),
    separator,
    affix,
  ];
  if (parameterId) {
    parts.push(
      separator,
      stringCase({
        case: _case,
        value: parameterId,
      }),
    );
  }
  return parts.join('');
};

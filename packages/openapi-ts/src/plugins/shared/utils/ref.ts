import type { StringCase } from '../../../types/config';
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
  id,
  type,
}: OperationIRRef & {
  readonly case?: StringCase;
  type: 'data' | 'error' | 'errors' | 'response' | 'responses';
}): string => {
  let affix = '';
  switch (type) {
    case 'data':
      affix = 'Data';
      break;
    case 'error':
      // error union
      affix = 'Error';
      break;
    case 'errors':
      // errors map
      affix = 'Errors';
      break;
    case 'response':
      // response union
      affix = 'Response';
      break;
    case 'responses':
      // responses map
      affix = 'Responses';
      break;
  }
  return `${irRef}${stringCase({
    case: _case,
    value: id,
  })}-${affix}`;
};

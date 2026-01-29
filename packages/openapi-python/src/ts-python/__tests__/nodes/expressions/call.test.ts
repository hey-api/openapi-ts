import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('call expression', () => {
  it('print', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createCallExpression(py.factory.createIdentifier('print'), [
        py.factory.createLiteral('hi'),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'call.py');
  });
});

import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('expression statement', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createExpressionStatement(
        py.factory.createCallExpression(py.factory.createIdentifier('print'), [
          py.factory.createLiteral('hello'),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.py');
  });
});

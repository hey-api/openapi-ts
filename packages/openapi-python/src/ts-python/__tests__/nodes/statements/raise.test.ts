import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('raise statement', () => {
  it('with exception', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createRaiseStatement(
        py.factory.createCallExpression(py.factory.createIdentifier('ValueError'), [
          py.factory.createLiteral('Invalid input'),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-exception.py');
  });

  it('re-raise', async () => {
    const file = py.factory.createSourceFile([py.factory.createRaiseStatement()]);
    await assertPrintedMatchesSnapshot(file, 'reraise.py');
  });
});

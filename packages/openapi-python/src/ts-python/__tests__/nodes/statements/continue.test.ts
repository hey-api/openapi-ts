import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('continue statement', () => {
  it('inside a while loop', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createWhileStatement(py.factory.createLiteral(true), [
        py.factory.createContinueStatement(),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'while.py');
  });
});

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('break statement', () => {
  it('inside a while loop', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createWhileStatement(py.factory.createLiteral(true), [
        py.factory.createBreakStatement(),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'while.py');
  });
});

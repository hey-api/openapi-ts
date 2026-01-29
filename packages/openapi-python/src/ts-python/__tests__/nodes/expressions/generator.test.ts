import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('generator expression', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('x_iter'),
        py.factory.createListExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createExpressionStatement(
        py.factory.createGeneratorExpression(
          py.factory.createIdentifier('x'),
          py.factory.createIdentifier('x'),
          py.factory.createIdentifier('x_iter'),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.py');
  });

  it('with filters', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('x_iter'),
        py.factory.createListExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createExpressionStatement(
        py.factory.createGeneratorExpression(
          py.factory.createIdentifier('x'),
          py.factory.createIdentifier('x'),
          py.factory.createIdentifier('x_iter'),
          [
            py.factory.createBinaryExpression(
              py.factory.createIdentifier('x'),
              '>',
              py.factory.createLiteral(10),
            ),
          ],
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-filter.py');
  });

  it('async', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('x_iter'),
        py.factory.createListExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createExpressionStatement(
        py.factory.createGeneratorExpression(
          py.factory.createIdentifier('x'),
          py.factory.createIdentifier('x'),
          py.factory.createIdentifier('x_iter'),
          undefined,
          true,
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'async.py');
  });
});

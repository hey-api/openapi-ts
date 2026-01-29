import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('augmented assignment statement', () => {
  it('arithmetic operators', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('x'), py.factory.createLiteral(0)),
      py.factory.createAssignment(py.factory.createIdentifier('y'), py.factory.createLiteral(0)),
      py.factory.createAssignment(py.factory.createIdentifier('z'), py.factory.createLiteral(0)),
      py.factory.createAssignment(py.factory.createIdentifier('a'), py.factory.createLiteral(0.0)),
      py.factory.createAssignment(py.factory.createIdentifier('b'), py.factory.createLiteral(0)),
      py.factory.createAssignment(py.factory.createIdentifier('c'), py.factory.createLiteral(0)),

      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('x'),
        '+=',
        py.factory.createLiteral(1),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('y'),
        '-=',
        py.factory.createLiteral(2),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('z'),
        '*=',
        py.factory.createLiteral(3),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('a'),
        '/=',
        py.factory.createLiteral(4),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('b'),
        '//=',
        py.factory.createLiteral(5),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('c'),
        '%=',
        py.factory.createLiteral(6),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'arithmetic.py');
  });

  it('power and bitwise operators', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('x'), py.factory.createLiteral(1)),
      py.factory.createAssignment(py.factory.createIdentifier('y'), py.factory.createLiteral(1)),
      py.factory.createAssignment(py.factory.createIdentifier('z'), py.factory.createLiteral(1)),
      py.factory.createAssignment(py.factory.createIdentifier('a'), py.factory.createLiteral(1)),
      py.factory.createAssignment(py.factory.createIdentifier('b'), py.factory.createLiteral(1)),
      py.factory.createAssignment(py.factory.createIdentifier('c'), py.factory.createLiteral(1)),

      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('x'),
        '**=',
        py.factory.createLiteral(2),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('y'),
        '&=',
        py.factory.createLiteral(1),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('z'),
        '|=',
        py.factory.createLiteral(1),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('a'),
        '^=',
        py.factory.createLiteral(1),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('b'),
        '>>=',
        py.factory.createLiteral(1),
      ),
      py.factory.createAugmentedAssignment(
        py.factory.createIdentifier('c'),
        '<<=',
        py.factory.createLiteral(1),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'bitwise.py');
  });
});

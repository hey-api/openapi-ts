import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('with statement', () => {
  it('with alias', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createClassDeclaration('context_manager', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createWithStatement(
        [
          py.factory.createWithItem(
            py.factory.createCallExpression(py.factory.createIdentifier('context_manager'), []),
            py.factory.createIdentifier('alias'),
          ),
        ],
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-alias.py');
  });

  it('with tuple alias', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createClassDeclaration('context_manager', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createWithStatement(
        [
          py.factory.createWithItem(
            py.factory.createCallExpression(py.factory.createIdentifier('context_manager'), []),
            py.factory.createTupleExpression([
              py.factory.createIdentifier('a'),
              py.factory.createIdentifier('b'),
            ]),
          ),
        ],
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-tuple-alias.py');
  });

  it('without alias', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createClassDeclaration('context_manager', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createWithStatement(
        [
          py.factory.createWithItem(
            py.factory.createCallExpression(py.factory.createIdentifier('context_manager'), []),
          ),
        ],
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with.py');
  });

  it('many with items', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createClassDeclaration('context_manager', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createClassDeclaration('context_manager2', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createClassDeclaration('context_manager3', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createWithStatement(
        [
          py.factory.createWithItem(
            py.factory.createCallExpression(py.factory.createIdentifier('context_manager'), []),
            py.factory.createIdentifier('alias'),
          ),
          py.factory.createWithItem(
            py.factory.createCallExpression(py.factory.createIdentifier('context_manager2'), []),
            py.factory.createTupleExpression([
              py.factory.createIdentifier('a'),
              py.factory.createIdentifier('b'),
            ]),
          ),
          py.factory.createWithItem(
            py.factory.createCallExpression(py.factory.createIdentifier('context_manager3'), []),
          ),
        ],
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-many-items.py');
  });

  it('with async', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createClassDeclaration('context_manager', [
        py.factory.createFunctionDeclaration(
          '__enter__',
          [py.factory.createFunctionParameter('self')],
          undefined,
          [py.factory.createReturnStatement(py.factory.createIdentifier('self'))],
        ),
        py.factory.createFunctionDeclaration(
          '__exit__',
          [
            py.factory.createFunctionParameter('self'),
            py.factory.createFunctionParameter('exc_type'),
            py.factory.createFunctionParameter('exc_val'),
            py.factory.createFunctionParameter('exc_tb'),
          ],
          undefined,
          [py.factory.createReturnStatement(py.factory.createLiteral(false))],
        ),
      ]),
      py.factory.createEmptyStatement(),
      py.factory.createFunctionDeclaration(
        'foo',
        [],
        undefined,
        [
          py.factory.createWithStatement(
            [
              py.factory.createWithItem(
                py.factory.createCallExpression(py.factory.createIdentifier('context_manager'), []),
              ),
            ],
            [],
            [py.factory.createIdentifier('async')],
          ),
        ],
        undefined,
        undefined,
        [py.factory.createIdentifier('async')],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-async.py');
  });
});

import { ts } from '../../../index';
import { createClassDeclaration } from '../../../nodes/declarations/class-declaration';
import { createMethodDeclaration } from '../../../nodes/declarations/method-declaration';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('decorator', () => {
  it('parameter decorator', async () => {
    const file = ts.factory.createSourceFile([
      createClassDeclaration(undefined, 'Service', undefined, undefined, [
        createMethodDeclaration(
          undefined,
          undefined,
          'handle',
          undefined,
          undefined,
          [
            ts.factory.createParameterDeclaration(
              [ts.factory.createDecorator(ts.factory.createIdentifier('inject'))],
              undefined,
              'value',
            ),
          ],
          undefined,
          ts.factory.createBlock([], false),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'parameter-decorator.ts');
  });
});

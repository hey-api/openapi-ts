import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('r-string expression', () => {
  it('simple pattern', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('pattern'),
        undefined,
        py.factory.createRStringExpression('^ses'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple-pattern.py');
  });

  it('pattern with quote characters', async () => {
    const cases = [
      { name: 'double-quote', value: '^ses"foo' },
      { name: 'single-quote', value: "^ses'foo" },
      { name: 'both-quotes', value: `^ses"foo'bar` },
    ];

    for (const { name, value } of cases) {
      const file = py.factory.createSourceFile([
        py.factory.createAssignment(
          py.factory.createIdentifier('pattern'),
          undefined,
          py.factory.createRStringExpression(value),
        ),
      ]);
      await assertPrintedMatchesSnapshot(file, `pattern-with-${name}.py`);
    }
  });

  it('degrades to plain string when value contains triple quote', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('pattern'),
        undefined,
        py.factory.createRStringExpression(`^ses"""foo'bar`),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'triple-quote-fallback.py');
  });

  it('degrades to plain string when value ends with odd backslashes', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('pattern'),
        undefined,
        py.factory.createRStringExpression('foo\\'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'odd-backslash-fallback.py');
  });
});

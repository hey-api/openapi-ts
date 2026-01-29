import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('comment', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([py.factory.createComment('This is a comment')]);
    await assertPrintedMatchesSnapshot(file, 'simple.py');
  });
});

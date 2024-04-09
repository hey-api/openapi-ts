import { describe, it } from 'vitest';

import { createClient } from './index';

describe('index', () => {
    it('parses v2 without issues', async () => {
        await createClient({
            dryRun: true,
            input: './test/spec/v2.json',
            output: './generated/v2/',
        });
    });

    it('parses v3 without issues', async () => {
        await createClient({
            dryRun: true,
            input: './test/spec/v3.json',
            output: './generated/v3/',
        });
    });

    it('downloads and parses v2 without issues', async () => {
        await createClient({
            dryRun: true,
            input: 'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v2.json',
            output: './generated/v2-downloaded/',
        });
    });

    it('downloads and parses v3 without issues', async () => {
        await createClient({
            dryRun: true,
            input: 'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts/test/spec/v3.json',
            output: './generated/v3-downloaded/',
        });
    });
});

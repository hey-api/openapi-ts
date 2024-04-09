import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { writeClientSchemas } from '../schemas';
import { openApi } from './models';

vi.mock('node:fs');

describe('writeClientSchemas', () => {
    it('writes to filesystem', async () => {
        if ('openapi' in openApi) {
            openApi.components = {
                schemas: {
                    foo: {
                        type: 'object',
                    },
                },
            };
        }

        await writeClientSchemas(openApi, '/');

        expect(writeFileSync).toHaveBeenCalledWith(path.resolve('/', '/schemas.ts'), expect.anything());
    });
});

import { fileURLToPath } from 'node:url';

import { createBaseConfig } from '../../vitest.config.base';

export default createBaseConfig(fileURLToPath(new URL('./', import.meta.url)));

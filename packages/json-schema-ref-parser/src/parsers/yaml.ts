import { parse } from 'yaml';

import type { FileInfo, JSONSchema, Plugin } from '../types';
import { ParserError } from '../util/errors';

export const yamlParser: Plugin = {
  // JSON is valid YAML
  canHandle: (file: FileInfo) => ['.yaml', '.yml', '.json'].includes(file.extension),
  handler: async (file: FileInfo): Promise<JSONSchema> => {
    const data = Buffer.isBuffer(file.data) ? file.data.toString() : file.data;

    if (typeof data !== 'string') {
      // data is already a JavaScript value (object, array, number, null, NaN, etc.)
      return data;
    }

    try {
      return parse(data) as JSONSchema;
    } catch (error: any) {
      throw new ParserError(error?.message || 'Parser Error', file.url);
    }
  },
  name: 'yaml',
};

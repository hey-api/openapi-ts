import { ono } from '@jsdevtools/ono';
import fs from 'fs';

import type { FileInfo } from '../types';
import { ResolverError } from '../util/errors';
import * as url from '../util/url';

export const fileResolver = {
  handler: async ({ file }: { file: FileInfo }): Promise<void> => {
    let path: string | undefined;

    try {
      path = url.toFileSystemPath(file.url);
    } catch (error: any) {
      throw new ResolverError(ono.uri(error, `Malformed URI: ${file.url}`), file.url);
    }

    try {
      const data = await fs.promises.readFile(path);
      file.data = data;
    } catch (error: any) {
      throw new ResolverError(ono(error, `Error opening file "${path}"`), path);
    }
  },
};

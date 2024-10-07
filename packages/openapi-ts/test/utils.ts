import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const getFilePaths = (dirPath: string): Array<string> => {
  let filePaths: Array<string> = [];
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      filePaths = filePaths.concat(getFilePaths(filePath));
    } else {
      filePaths.push(filePath);
    }
  }

  return filePaths;
};

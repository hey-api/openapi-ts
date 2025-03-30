import fs from 'node:fs';

export const copyAsset = (fileNameIn: string, fileNameOut: string) => {
  fs.copyFileSync(
    `./test/e2e/assets/${fileNameIn}`,
    `./test/e2e/generated/${fileNameOut}`
  )
}

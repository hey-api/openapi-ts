import { copyFileSync } from 'node:fs'

export const copyAsset = (fileNameIn: string, fileNameOut: string) => {
  copyFileSync(
    `./test/e2e/assets/${fileNameIn}`,
    `./test/e2e/generated/${fileNameOut}`
  )
}

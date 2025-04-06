import fs from 'node:fs';

export const cleanup = (dir: string) => {
  fs.rmSync(`./test/e2e/generated/${dir}/`, {
    force: true,
    recursive: true
  })
}

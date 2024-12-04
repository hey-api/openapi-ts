import fs from 'node:fs';
import path from 'node:path'

import { sync } from 'cross-spawn'

export const createAngularProject = (dir: string, name: string) => {
  const cwd = `./test/e2e/generated/${dir}/`
  fs.mkdirSync(cwd, {
    recursive: true
  })
  sync(
    'ng',
    [
      'new',
      name,
      '--minimal',
      'true',
      '--style',
      'css',
      '--inline-style',
      'true',
      '--inline-template',
      'true',
      '--routing',
      'false',
      '--ssr',
      'false',
      '--skip-tests',
      'true',
      '--skip-git',
      'true',
      '--commit',
      'false',
      '--force'
    ],
    {
      cwd: path.resolve(cwd),
      stdio: 'inherit'
    }
  )
  fs.rmSync(`${cwd}/${name}/src/app/`, {
    recursive: true
  })
}

export const buildAngularProject = (
  dir: string,
  name: string,
  output: string
) => {
  const cwd = `./test/e2e/generated/${dir}/${name}/`
  sync(
    'ng',
    [
      'build',
      '--output-path',
      output,
      '--optimization',
      'false',
      '--configuration',
      'development',
      '--source-map',
      'false'
    ],
    {
      cwd: path.resolve(cwd),
      stdio: 'inherit'
    }
  )
}

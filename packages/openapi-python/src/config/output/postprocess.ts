import type { PostProcessor } from '@hey-api/shared';

export const postProcessors = {
  autopep8: {
    args: ['--in-place', '{{path}}'],
    command: 'autopep8',
    name: 'autopep8',
  },
  black: {
    args: ['{{path}}'],
    command: 'black',
    name: 'Black',
  },
  isort: {
    args: ['{{path}}'],
    command: 'isort',
    name: 'isort',
  },
  'ruff:format': {
    args: ['format', '{{path}}'],
    command: 'ruff',
    name: 'Ruff (Format)',
  },
  'ruff:lint': {
    args: ['check', '--fix', '{{path}}'],
    command: 'ruff',
    name: 'Ruff (Lint)',
  },
  yapf: {
    args: ['-i', '{{path}}'],
    command: 'yapf',
    name: 'YAPF',
  },
} as const satisfies Record<string, PostProcessor>;

export type PostProcessorPreset = keyof typeof postProcessors;

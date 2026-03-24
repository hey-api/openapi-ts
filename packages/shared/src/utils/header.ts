import type { IProject } from '@hey-api/codegen-core';

import type { OutputHeader } from '../config/output/types';

/**
 * Converts an {@link OutputHeader} value to a string prefix for file content.
 */
export function outputHeaderToPrefix(ctx: {
  defaultValue: ReadonlyArray<string>;
  header: OutputHeader;
  project: IProject;
}): string {
  const { defaultValue, header, project } = ctx;
  let lines = typeof header === 'function' ? header({ defaultValue, project }) : header;
  if (lines === undefined) lines = defaultValue;
  if (lines === null) return '';
  lines =
    typeof lines === 'string' ? lines.split(/\r?\n/) : lines.flatMap((line) => line.split(/\r?\n/));
  const content = lines.join('\n');
  return content ? `${content}\n\n` : '';
}

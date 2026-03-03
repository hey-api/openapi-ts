import type { IProject } from '@hey-api/codegen-core';

import type { OutputHeader } from '../config/output/types';

/**
 * Converts an {@link OutputHeader} value to a string prefix for file content.
 */
export function outputHeaderToPrefix(header: OutputHeader, project: IProject): string {
  let lines = typeof header === 'function' ? header({ project }) : header;
  if (lines === null || lines === undefined) return '';
  lines =
    typeof lines === 'string' ? lines.split(/\r?\n/) : lines.flatMap((line) => line.split(/\r?\n/));
  const content = lines.join('\n');
  return content ? `${content}\n\n` : '';
}

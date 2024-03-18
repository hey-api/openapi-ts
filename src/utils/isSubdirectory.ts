import path from 'node:path';

export const isSubDirectory = (parent: string, child: string) => path.relative(child, parent).startsWith('..');

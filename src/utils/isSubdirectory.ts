import { relative } from 'path';

export const isSubDirectory = (parent: string, child: string) => relative(child, parent).startsWith('..');

import { relative } from 'path';

export function isSubDirectory(parent: string, child: string) {
    return relative(child, parent).startsWith('..');
}

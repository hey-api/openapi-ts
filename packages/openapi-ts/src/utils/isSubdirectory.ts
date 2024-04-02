import path from 'node:path';

export const isSubDirectory = (parent: string, child: string) => {
    const relative = path.relative(parent, child);
    return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
};

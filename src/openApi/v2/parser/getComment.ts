import { EOL } from 'os';

/**
 * Cleanup comment and prefix multiline comments with "*",
 * so they look a bit nicer when used in the generated code.
 * @param comment
 */
export function getComment(comment?: string): string | null {
    if (comment) {
        return comment.replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
    }
    return null;
}

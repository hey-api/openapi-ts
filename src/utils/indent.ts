import { EOL } from 'os';

export function indent(s: string): string {
    let lines = s.split(EOL);
    lines = lines.map(line => {
        return line.replace(/\t/g, '    ');
    });
    return lines.join(EOL);
}

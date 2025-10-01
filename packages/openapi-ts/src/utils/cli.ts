import colors from 'ansi-colors';

import { loadPackageJson } from '../generate/tsConfig';

const textAscii = `
888   |                           e      888~-_   888
888___|  e88~~8e  Y88b  /        d8b     888   \\  888
888   | d888  88b  Y888/        /Y88b    888    | 888
888   | 8888__888   Y8/        /  Y88b   888   /  888
888   | Y888    ,    Y        /____Y88b  888_-~   888
888   |  "88___/    /        /      Y88b 888      888
                  _/
`;

const asciiToLines = (
  ascii: string,
  options?: {
    padding?: number;
  },
) => {
  const lines: Array<string> = [];
  const padding = Array.from<string>({ length: options?.padding ?? 0 }).fill(
    '',
  );
  lines.push(...padding);
  let maxLineLength = 0;
  let line = '';
  for (const char of ascii) {
    if (char === '\n') {
      if (line) {
        lines.push(line);
        maxLineLength = Math.max(maxLineLength, line.length);
        line = '';
      }
    } else {
      line += char;
    }
  }
  lines.push(...padding);
  return { lines, maxLineLength };
};

export function printCliIntro() {
  const packageJson = loadPackageJson();
  const text = asciiToLines(textAscii, { padding: 1 });
  for (const line of text.lines) {
    console.log(colors.cyan(line));
  }
  console.log(colors.gray(`${packageJson.name} v${packageJson.version}`));
  console.log('');
}

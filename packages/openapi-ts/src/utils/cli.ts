import colors from 'ansi-colors';

import { loadPackageJson } from '../generate/tsConfig';

const logoAscii = `
db e888888e
 d8 Y88Y  ~8b
dY ""   ""  Yb
8  88   88   8
8     o     8 8
 Yb  b8d  eb ,b
  Yb_____Y  ,b
  8       dY
 8  e    8
`;

const textAscii = `
888   |                           e      888~-_   888
888___|  e88~~8e  Y88b  /        d8b     888   \\  888
888   | d888  88b  Y888/        /Y88b    888    | 888
888   | 8888__888   Y8/        /  Y88b   888   /  888
888   | Y888    ,    Y        /____Y88b  888_-~   888
888   |  "88___/    /        /      Y88b 888      888
                  _/
`;

const asciiToLines = (ascii: string) => {
  const lines: Array<string> = [];
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
  return { lines, maxLineLength };
};

export function printCliIntro() {
  const packageJson = loadPackageJson();
  const logo = asciiToLines(logoAscii);
  const text = asciiToLines(textAscii);
  const padding = Math.floor((logo.lines.length - text.lines.length) / 2);
  const lines = logo.lines.map((logoLine, index) => {
    let line = logoLine.padEnd(logo.maxLineLength);
    if (index >= padding && logo.lines.length - index - 1 >= padding) {
      line += `       ${text.lines[index - padding]}`;
    }
    return line;
  });
  for (const line of lines) {
    console.log(colors.cyan(line));
  }
  console.log('');
  console.log(colors.gray(`${packageJson.name} v${packageJson.version}`));
  console.log('');
}

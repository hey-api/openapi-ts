const uppercaseRegExp = /[\p{Lu}]/u;
const lowercaseRegExp = /[\p{Ll}]/u;
const identifierRegExp = /([\p{Alpha}\p{N}_]|$)/u;
const separatorsRegExp = /[_.\- ]+/;

const LEADING_SEPARATORS = new RegExp('^' + separatorsRegExp.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(
  separatorsRegExp.source + identifierRegExp.source,
  'gu',
);
const NUMBERS_AND_IDENTIFIER = new RegExp(
  '\\d+' + identifierRegExp.source,
  'gu',
);

const preserveCase = ({
  string,
  style,
}: {
  string: string;
  readonly style?: 'camelCase' | 'PascalCase' | 'snake_case';
}) => {
  let isLastCharLower = false;
  let isLastCharUpper = false;
  let isLastLastCharUpper = false;
  let isLastLastCharPreserved = false;

  const separator = style === 'snake_case' ? '_' : '-';

  for (let index = 0; index < string.length; index++) {
    const character = string[index];
    isLastLastCharPreserved =
      index > 2 ? string[index - 3] === separator : true;

    uppercaseRegExp.lastIndex = 0;
    if (isLastCharLower && uppercaseRegExp.test(character)) {
      string = `${string.slice(0, index)}${separator}${string.slice(index)}`;
      index++;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharLower = false;
      isLastCharUpper = true;
    } else {
      let nextIndex = index + 1;
      let nextCharacter = string[nextIndex];
      separatorsRegExp.lastIndex = 0;
      while (nextCharacter && separatorsRegExp.test(nextCharacter)) {
        nextIndex += 1;
        nextCharacter = string[nextIndex];
      }

      if (
        isLastCharUpper &&
        isLastLastCharUpper &&
        lowercaseRegExp.test(character) &&
        !isLastLastCharPreserved &&
        // naive detection of plurals
        !(
          character === 's' &&
          (!nextCharacter ||
            nextCharacter.toLocaleLowerCase() !== nextCharacter)
        )
      ) {
        string = `${string.slice(0, index - 1)}${separator}${string.slice(index - 1)}`;
        isLastLastCharUpper = isLastCharUpper;
        isLastCharLower = true;
        isLastCharUpper = false;
      } else {
        const characterLower = character.toLocaleLowerCase();
        const characterUpper = character.toLocaleUpperCase();
        isLastLastCharUpper = isLastCharUpper;
        isLastCharLower =
          characterLower === character && characterUpper !== character;
        isLastCharUpper =
          characterUpper === character && characterLower !== character;
      }
    }
  }

  return string;
};

export const stringCase = ({
  input,
  style,
}: {
  input: string;
  readonly style?: 'camelCase' | 'PascalCase' | 'snake_case';
}): string => {
  let result = input.trim();

  if (!result.length) {
    return '';
  }

  if (result.length === 1) {
    separatorsRegExp.lastIndex = 0;
    if (separatorsRegExp.test(result)) {
      return '';
    }

    return style === 'PascalCase'
      ? result.toLocaleUpperCase()
      : result.toLocaleLowerCase();
  }

  const hasUpperCase = result !== result.toLocaleLowerCase();

  if (hasUpperCase) {
    result = preserveCase({ string: result, style });
  }

  result = result.replace(LEADING_SEPARATORS, '');
  result = result.toLocaleLowerCase();

  if (style === 'PascalCase') {
    result = result.charAt(0).toLocaleUpperCase() + result.slice(1);
  }

  if (style !== 'snake_case') {
    SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
    NUMBERS_AND_IDENTIFIER.lastIndex = 0;

    result = result.replaceAll(NUMBERS_AND_IDENTIFIER, (match, _, offset) => {
      if (['_', '-', '.'].includes(result.charAt(offset + match.length))) {
        return match;
      }

      return match.toLocaleUpperCase();
    });

    result = result.replaceAll(SEPARATORS_AND_IDENTIFIER, (_, identifier) =>
      identifier.toLocaleUpperCase(),
    );
  }

  return result;
};

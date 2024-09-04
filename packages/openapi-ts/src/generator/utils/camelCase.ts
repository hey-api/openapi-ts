const UPPERCASE = /[\p{Lu}]/u;
const LOWERCASE = /[\p{Ll}]/u;
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
const SEPARATORS = /[_.\- ]+/;

const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(
  SEPARATORS.source + IDENTIFIER.source,
  'gu',
);
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');

const preserveCamelCase = (string: string) => {
  let isLastCharLower = false;
  let isLastCharUpper = false;
  let isLastLastCharUpper = false;
  let isLastLastCharPreserved = false;

  for (let index = 0; index < string.length; index++) {
    const character = string[index];
    isLastLastCharPreserved = index > 2 ? string[index - 3] === '-' : true;

    if (isLastCharLower && UPPERCASE.test(character)) {
      string = string.slice(0, index) + '-' + string.slice(index);
      isLastCharLower = false;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = true;
      index++;
    } else if (
      isLastCharUpper &&
      isLastLastCharUpper &&
      LOWERCASE.test(character) &&
      !isLastLastCharPreserved
    ) {
      string = string.slice(0, index - 1) + '-' + string.slice(index - 1);
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = false;
      isLastCharLower = true;
    } else {
      isLastCharLower =
        character.toLocaleLowerCase() === character &&
        character.toLocaleUpperCase() !== character;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper =
        character.toLocaleUpperCase() === character &&
        character.toLocaleLowerCase() !== character;
    }
  }

  return string;
};

/**
 * Convert a dash/dot/underscore/space separated string to camelCase or PascalCase: `foo-bar` → `fooBar`. Correctly handles Unicode strings. Returns transformed string.
 */
export const camelCase = ({
  input,
  pascalCase,
}: {
  input: string;
  /**
   * Uppercase the first character: `foo-bar` → `FooBar`
   *
   * @default false
   */
  readonly pascalCase?: boolean;
}): string => {
  let result = input.trim();

  if (!result.length) {
    return '';
  }

  if (result.length === 1) {
    if (SEPARATORS.test(result)) {
      return '';
    }

    return pascalCase ? result.toLocaleUpperCase() : result.toLocaleLowerCase();
  }

  const hasUpperCase = result !== result.toLocaleLowerCase();

  if (hasUpperCase) {
    result = preserveCamelCase(result);
  }

  result = result.replace(LEADING_SEPARATORS, '');
  result = result.toLocaleLowerCase();

  if (pascalCase) {
    result = result.charAt(0).toLocaleUpperCase() + result.slice(1);
  }

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

  return result;
};

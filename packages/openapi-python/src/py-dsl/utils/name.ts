import { regexp } from './regexp';
import type { ReservedList } from './reserved';
import { reserved } from './reserved';

export const safeAccessorName = (name: string): string => {
  regexp.number.lastIndex = 0;
  if (regexp.number.test(name)) {
    return name.startsWith('-') ? `'${name}'` : name;
  }

  regexp.pythonIdentifier.lastIndex = 0;
  if (regexp.pythonIdentifier.test(name)) {
    return name;
  }
  return `'${name}'`;
};

const validPythonChar = /^[a-zA-Z0-9_]$/;

const safeName = (name: string, reserved: ReservedList): string => {
  let sanitized = '';
  let index: number;

  const first = name[0] ?? '';
  regexp.illegalStartCharacters.lastIndex = 0;
  if (regexp.illegalStartCharacters.test(first)) {
    // Check if character becomes valid when not in leading position (e.g., digits)
    if (validPythonChar.test(first)) {
      sanitized += '_';
      index = 0;
    } else {
      sanitized += '_';
      index = 1;
    }
  } else {
    sanitized += first;
    index = 1;
  }

  while (index < name.length) {
    const char = name[index] ?? '';
    sanitized += validPythonChar.test(char) ? char : '_';
    index += 1;
  }

  if (reserved['~values'].has(sanitized)) {
    sanitized = `${sanitized}_`;
  }

  return sanitized || '_';
};

export const safeRuntimeName = (name: string): string => safeName(name, reserved.runtime);

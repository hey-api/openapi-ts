import type { Enum, Model } from '../openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../openApi';
import { unescapeName } from './escape';
import { sort } from './sort';
import { unique } from './unique';

/**
 * Sanitizes names of enums, so they are valid typescript identifiers of a certain form.
 *
 * 1: Replace all characters not legal as part of identifier with '_'
 * 2: Add '_' prefix if first character of enum name has character not legal for start of identifier
 * 3: Add '_' where the string transitions from lowercase to uppercase
 * 4: Transform the whole string to uppercase
 *
 * Javascript identifier regexp pattern retrieved from https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
export const enumKey = (value?: string | number, customName?: string) => {
  if (customName) {
    return customName;
  }
  // prefix numbers with underscore
  if (typeof value === 'number') {
    return `'_${value}'`;
  }

  let key = '';
  if (typeof value === 'string') {
    key = value
      .replace(/[^$\u200c\u200d\p{ID_Continue}]/gu, '_')
      .replace(/^([^$_\p{ID_Start}])/u, '_$1')
      .replace(/(\p{Lowercase})(\p{Uppercase}+)/gu, '$1_$2');
  }
  key = key.trim();
  if (!key) {
    key = 'empty_string';
  }
  return key.toUpperCase();
};

export const enumUnionType = (enums: Enum[]) =>
  enums
    .map((enumerator) => enumValue(enumerator.value, true))
    .filter(unique)
    .join(' | ');

export const enumValue = (value?: string | number, union: boolean = false) => {
  if (typeof value === 'string') {
    if (value.includes("'") && union) {
      return `"${value}"`;
    }
    return `'${value}'`;
  }
  return value;
};

export const enumEntry = (enumerator: Enum) => {
  const key = enumKey(enumerator.value, enumerator.customName);
  const value = enumValue(enumerator.value);
  return { key, value };
};

/**
 * Represent enum in `meta` object for deduplication
 */
export const enumMeta = (model: Model): Required<Model>['meta'] => {
  // serialize enum values in namespace for quick lookup
  const serialized = model.enum
    .map((enumerator) => enumEntry(enumerator))
    .sort((a, b) => sort(a.key, b.key))
    .map((enumerator) => `${enumerator.key}=${enumerator.value}`)
    .join('&');
  return {
    $ref: `enum/${model.name}/${serialized}`,
    name: ensureValidTypeScriptJavaScriptIdentifier(unescapeName(model.name)),
  };
};

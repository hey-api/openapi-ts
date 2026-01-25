/**
 * Capitalize the first character of a string.
 * @example capitalizeFirst('router') // 'Router'
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert kebab-case to camelCase.
 * @example toCamelCase('chat-messages') // 'chatMessages'
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

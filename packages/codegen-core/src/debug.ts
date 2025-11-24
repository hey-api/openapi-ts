import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

colors.enabled = colorSupport().hasBasic;

const DEBUG_GROUPS = {
  dsl: colors.cyanBright,
  registry: colors.blueBright,
  symbol: colors.magentaBright,
} as const;

export function debug(message: string, group: keyof typeof DEBUG_GROUPS) {
  const value = process.env.DEBUG;
  if (!value) return;

  const groups = value.split(',').map((x) => x.trim().toLowerCase());

  if (
    !(
      groups.includes('*') ||
      groups.includes('heyapi:*') ||
      groups.includes(`heyapi:${group}`) ||
      groups.includes(group)
    )
  ) {
    return;
  }

  const color = DEBUG_GROUPS[group] ?? colors.whiteBright;
  const prefix = color(`heyapi:${group}`);

  console.debug(`${prefix} ${message}`);
}

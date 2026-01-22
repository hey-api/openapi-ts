/**
 * Detect if the current session is interactive based on TTY status and environment variables.
 * This is used as a fallback when the user doesn't explicitly set the interactive option.
 * @internal
 */
export function detectInteractiveSession(): boolean {
  return Boolean(
    process.stdin.isTTY &&
      process.stdout.isTTY &&
      !process.env.CI &&
      !process.env.NO_INTERACTIVE &&
      !process.env.NO_INTERACTION,
  );
}

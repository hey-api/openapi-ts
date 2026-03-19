export type Logs = {
  /**
   * Whether or not error logs should be written to a file or not
   *
   * @default true
   * */
  file?: boolean;
  /**
   * The logging level to control the verbosity of log output.
   * Determines which messages are logged based on their severity.
   *
   * Available levels (in increasing order of severity):
   * - `trace`: Detailed debug information, primarily for development.
   * - `debug`: Diagnostic information useful during debugging.
   * - `info`: General operational messages that indicate normal application behavior.
   * - `warn`: Potentially problematic situations that require attention.
   * - `error`: Errors that prevent some functionality but do not crash the application.
   * - `fatal`: Critical errors that cause the application to terminate.
   * - `silent`: Disables all logging.
   *
   * Messages with a severity equal to or higher than the specified level will be logged.
   *
   * @default 'info'
   */
  level?: 'debug' | 'error' | 'fatal' | 'info' | 'silent' | 'trace' | 'warn';
  /**
   * The relative location of the logs folder
   *
   * @default process.cwd()
   */
  path?: string;
};

export interface CliConfig {
  configFile?: string;
  dryRun?: boolean;
  input?: string | Array<string>;
  logs?: {
    file?: false;
    level?: 'debug' | 'silent';
    path?: string;
  };
  output?: string | Array<string>;
  plugins?: Array<string>;
  watch?: boolean | number;
}

export interface CliContext {
  config: {
    input: ReadonlyArray<{
      watch?: {
        enabled?: boolean;
      };
    }>;
  };
}

export interface RunCliOptions {
  createClient: (...args: Array<any>) => Promise<ReadonlyArray<CliContext>>;
  meta: {
    description: string;
    name: string;
    version: string;
  };
}

export type Input = {
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Projects are private by default, you will need to be authenticated
   * to download OpenAPI specifications. We recommend using project API
   * keys in CI workflows and personal API keys for local development.
   *
   * API key isn't required for public projects. You can also omit this
   * parameter and provide an environment variable `HEY_API_TOKEN`.
   */
  api_key?: string;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * You can fetch the last build from branch by providing the branch
   * name.
   */
  branch?: string;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * You can fetch an exact specification by providing a commit sha.
   * This will always return the same file.
   */
  commit_sha?: string;
  /**
   * You can pass any valid Fetch API options to the request for fetching your
   * specification. This is useful if your file is behind auth for example.
   */
  fetch?: RequestInit;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Organization created in Hey API Platform.
   */
  organization?: string;
  /**
   * Path to the OpenAPI specification. This can be:
   *   - path
   *   - URL
   *   - API registry shorthand
   *
   * Both JSON and YAML file formats are supported. You can also pass the parsed
   * object directly if you're fetching the file yourself.
   */
  path?:
    | `https://get.heyapi.dev/${string}/${string}`
    | `${string}/${string}`
    | `readme:@${string}/${string}#${string}`
    | `readme:${string}`
    | (string & {})
    | Record<string, unknown>;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Project created in Hey API Platform.
   */
  project?: string;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * If you're tagging your specifications with custom tags, you can use
   * them to filter the results. When you provide multiple tags, only
   * the first match will be returned.
   */
  tags?: ReadonlyArray<string>;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Every OpenAPI document contains a required version field. You can
   * use this value to fetch the last uploaded specification matching
   * the value.
   */
  version?: string;
  /**
   * Regenerate the client when the input file changes? You can alternatively
   * pass a numeric value for the interval in ms.
   *
   * @default false
   */
  watch?: boolean | number | Watch;
};

export type Watch = {
  /**
   * Regenerate the client when the input file changes?
   *
   * @default false
   */
  enabled?: boolean;
  /**
   * How often should we attempt to detect the input file change? (in ms)
   *
   * @default 1000
   */
  interval?: number;
  /**
   * How long will we wait before the request times out?
   *
   * @default 60_000
   */
  timeout?: number;
};

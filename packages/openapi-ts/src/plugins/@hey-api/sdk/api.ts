export type Api = {
  /**
   * @param type Selector type.
   * @param value Depends on `type`:
   *  - `buildClientParams`: never
   *  - `client`: never
   *  - `formDataBodySerializer`: never
   *  - `function`: `operation.id` string
   *  - `Options`: never
   *  - `urlSearchParamsBodySerializer`: never
   * @returns Selector array
   */
  getSelector: (
    type:
      | 'buildClientParams'
      | 'client'
      | 'formDataBodySerializer'
      | 'function'
      | 'Options'
      | 'urlSearchParamsBodySerializer',
    value?: string,
  ) => ReadonlyArray<string>;
};

const getSelector: Api['getSelector'] = (...args) => [
  'sdk',
  ...(args as Array<string>),
];

export const api: Api = {
  getSelector,
};

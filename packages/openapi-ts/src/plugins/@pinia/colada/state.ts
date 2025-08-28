export interface PluginState {
  hasCreateQueryKeyParamsFunction: boolean;
  hasMutations: boolean;
  hasQueries: boolean;
  hasUsedQueryFn: boolean;
}

export const getInitialState = (): PluginState => ({
  hasCreateQueryKeyParamsFunction: false,
  hasMutations: false,
  hasQueries: false,
  hasUsedQueryFn: false,
});

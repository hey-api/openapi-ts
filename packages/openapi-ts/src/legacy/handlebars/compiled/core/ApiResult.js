export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export type ApiResult<TData = any> = {\n	readonly body: TData;\n	readonly ok: boolean;\n	readonly status: number;\n	readonly statusText: string;\n	readonly url: string;\n};';
  },
  useData: true,
};

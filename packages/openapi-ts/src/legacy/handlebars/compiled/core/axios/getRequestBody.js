export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const getRequestBody = (options: ApiRequestOptions): unknown => {\n	if (options.body) {\n		return options.body;\n	}\n	return undefined;\n};';
  },
  useData: true,
};

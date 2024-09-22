export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const getResponseHeader = <T>(response: HttpResponse<T>, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const value = response.headers.get(responseHeader);\n		if (isString(value)) {\n			return value;\n		}\n	}\n	return undefined;\n};';
  },
  useData: true,
};

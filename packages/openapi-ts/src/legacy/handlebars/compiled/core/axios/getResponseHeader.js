export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const getResponseHeader = (response: AxiosResponse<unknown>, responseHeader?: string): string | undefined => {\n	if (responseHeader) {\n		const content = response.headers[responseHeader];\n		if (isString(content)) {\n			return content;\n		}\n	}\n	return undefined;\n};';
  },
  useData: true,
};

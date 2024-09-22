export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const getResponseBody = (response: AxiosResponse<unknown>): unknown => {\n	if (response.status !== 204) {\n		return response.data;\n	}\n	return undefined;\n};';
  },
  useData: true,
};

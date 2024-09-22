export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const getResponseBody = <T>(response: HttpResponse<T>): T | undefined => {\n	if (response.status !== 204 && response.body !== null) {\n		return response.body;\n	}\n	return undefined;\n};';
  },
  useData: true,
};

export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const isSuccess = (status: number): boolean => {\n	return status >= 200 && status < 300;\n};';
  },
  useData: true,
};

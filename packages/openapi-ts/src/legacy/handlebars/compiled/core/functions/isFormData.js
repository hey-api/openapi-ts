export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const isFormData = (value: unknown): value is FormData => {\n	return value instanceof FormData;\n};';
  },
  useData: true,
};

export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const isString = (value: unknown): value is string => {\n	return typeof value === 'string';\n};";
  },
  useData: true,
};

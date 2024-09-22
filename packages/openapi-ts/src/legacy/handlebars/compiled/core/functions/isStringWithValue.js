export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const isStringWithValue = (value: unknown): value is string => {\n	return isString(value) && value !== '';\n};";
  },
  useData: true,
};

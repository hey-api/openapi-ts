export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const isBlob = (value: any): value is Blob => {\n	return value instanceof Blob;\n};';
  },
  useData: true,
};

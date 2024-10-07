export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const base64 = (str: string): string => {\n	try {\n		return btoa(str);\n	} catch (err) {\n		// @ts-ignore\n		return Buffer.from(str).toString('base64');\n	}\n};";
  },
  useData: true,
};

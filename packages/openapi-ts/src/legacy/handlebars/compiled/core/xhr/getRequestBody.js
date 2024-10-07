export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const getRequestBody = (options: ApiRequestOptions): unknown => {\n	if (options.body !== undefined) {\n		if (options.mediaType?.includes('application/json') || options.mediaType?.includes('+json')) {\n			return JSON.stringify(options.body);\n		} else if (isString(options.body) || isBlob(options.body) || isFormData(options.body)) {\n			return options.body;\n		} else {\n			return JSON.stringify(options.body);\n		}\n	}\n	return undefined;\n};";
  },
  useData: true,
};

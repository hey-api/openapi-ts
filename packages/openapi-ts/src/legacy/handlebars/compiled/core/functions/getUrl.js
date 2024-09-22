export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {\n	const encoder = config.ENCODE_PATH || encodeURI;\n\n	const path = options.url\n		.replace('{api-version}', config.VERSION)\n		.replace(/{(.*?)}/g, (substring: string, group: string) => {\n			if (options.path?.hasOwnProperty(group)) {\n				return encoder(String(options.path[group]));\n			}\n			return substring;\n		});\n\n	const url = config.BASE + path;\n	return options.query ? url + getQueryString(options.query) : url;\n};";
  },
  useData: true,
};

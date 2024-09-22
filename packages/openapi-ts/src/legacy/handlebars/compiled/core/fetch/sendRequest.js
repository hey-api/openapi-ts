export default {
  1: function (container, depth0, helpers, partials, data) {
    return '	if (config.WITH_CREDENTIALS) {\n		request.credentials = config.CREDENTIALS;\n	}\n';
  },
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    var stack1,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      'export const sendRequest = async (\n	config: OpenAPIConfig,\n	options: ApiRequestOptions,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: Headers,\n	onCancel: OnCancel\n): Promise<Response> => {\n	const controller = new AbortController();\n\n	let request: RequestInit = {\n		headers,\n		body: body ?? formData,\n		method: options.method,\n		signal: controller.signal,\n	};\n\n' +
      ((stack1 = lookupProperty(helpers, 'equals').call(
        depth0 != null ? depth0 : container.nullContext || {},
        lookupProperty(
          lookupProperty(
            lookupProperty(lookupProperty(data, 'root'), '$config'),
            'client',
          ),
          'name',
        ),
        'legacy/fetch',
        {
          name: 'equals',
          hash: {},
          fn: container.program(1, data, 0),
          inverse: container.noop,
          data: data,
          loc: {
            start: { line: 19, column: 1 },
            end: { line: 23, column: 12 },
          },
        },
      )) != null
        ? stack1
        : '') +
      '\n	for (const fn of config.interceptors.request._fns) {\n		request = await fn(request);\n	}\n\n	onCancel(() => controller.abort());\n\n	return await fetch(url, request);\n};'
    );
  },
  useData: true,
};

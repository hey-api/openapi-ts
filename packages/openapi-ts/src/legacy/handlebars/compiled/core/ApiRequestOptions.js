export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export type ApiRequestOptions<T = unknown> = {\n	readonly body?: any;\n	readonly cookies?: Record<string, unknown>;\n	readonly errors?: Record<number | string, string>;\n	readonly formData?: Record<string, unknown> | any[] | Blob | File;\n	readonly headers?: Record<string, unknown>;\n	readonly mediaType?: string;\n	readonly method:\n		| 'DELETE'\n		| 'GET'\n		| 'HEAD'\n		| 'OPTIONS'\n		| 'PATCH'\n		| 'POST'\n		| 'PUT';\n	readonly path?: Record<string, unknown>;\n	readonly query?: Record<string, unknown>;\n	readonly responseHeader?: string;\n	readonly responseTransformer?: (data: unknown) => Promise<T>;\n	readonly url: string;\n};";
  },
  useData: true,
};

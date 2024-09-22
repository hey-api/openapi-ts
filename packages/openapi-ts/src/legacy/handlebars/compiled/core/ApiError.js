export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "import type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\n\nexport class ApiError extends Error {\n	public readonly url: string;\n	public readonly status: number;\n	public readonly statusText: string;\n	public readonly body: unknown;\n	public readonly request: ApiRequestOptions;\n\n	constructor(request: ApiRequestOptions, response: ApiResult, message: string) {\n		super(message);\n\n		this.name = 'ApiError';\n		this.url = response.url;\n		this.status = response.status;\n		this.statusText = response.statusText;\n		this.body = response.body;\n		this.request = request;\n	}\n}";
  },
  useData: true,
};

export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const sendRequest = async (\n	config: OpenAPIConfig,\n	options: ApiRequestOptions,\n	url: string,\n	body: any,\n	formData: FormData | undefined,\n	headers: Headers,\n	onCancel: OnCancel\n): Promise<XMLHttpRequest> => {\n	let xhr = new XMLHttpRequest();\n	xhr.open(options.method, url, true);\n	xhr.withCredentials = config.WITH_CREDENTIALS;\n\n	headers.forEach((value, key) => {\n		xhr.setRequestHeader(key, value);\n	});\n\n	return new Promise<XMLHttpRequest>(async (resolve, reject) => {\n		xhr.onload = () => resolve(xhr);\n		xhr.onabort = () => reject(new Error('Request aborted'));\n		xhr.onerror = () => reject(new Error('Network error'));\n\n		for (const fn of config.interceptors.request._fns) {\n			xhr = await fn(xhr);\n		}\n\n		xhr.send(body ?? formData);\n\n		onCancel(() => xhr.abort());\n	});\n};";
  },
  useData: true,
};

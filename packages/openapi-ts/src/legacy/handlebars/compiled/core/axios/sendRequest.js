export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const sendRequest = async <T>(\n	config: OpenAPIConfig,\n	options: ApiRequestOptions<T>,\n	url: string,\n	body: unknown,\n	formData: FormData | undefined,\n	headers: Record<string, string>,\n	onCancel: OnCancel,\n	axiosClient: AxiosInstance\n): Promise<AxiosResponse<T>> => {\n	const controller = new AbortController();\n\n	let requestConfig: AxiosRequestConfig = {\n		data: body ?? formData,\n		headers,\n		method: options.method,\n		signal: controller.signal,\n		url,\n		withCredentials: config.WITH_CREDENTIALS,\n	};\n\n	onCancel(() => controller.abort());\n\n	for (const fn of config.interceptors.request._fns) {\n		requestConfig = await fn(requestConfig);\n	}\n\n	try {\n		return await axiosClient.request(requestConfig);\n	} catch (error) {\n		const axiosError = error as AxiosError<T>;\n		if (axiosError.response) {\n			return axiosError.response;\n		}\n		throw error;\n	}\n};';
  },
  useData: true,
};

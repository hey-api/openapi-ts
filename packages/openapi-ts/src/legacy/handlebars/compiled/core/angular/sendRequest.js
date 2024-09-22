export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const sendRequest = <T>(\n	config: OpenAPIConfig,\n	options: ApiRequestOptions<T>,\n	http: HttpClient,\n	url: string,\n	body: unknown,\n	formData: FormData | undefined,\n	headers: HttpHeaders\n): Observable<HttpResponse<T>> => {\n	return http.request<T>(options.method, url, {\n		headers,\n		body: body ?? formData,\n		withCredentials: config.WITH_CREDENTIALS,\n		observe: 'response',\n	});\n};";
  },
  useData: true,
};

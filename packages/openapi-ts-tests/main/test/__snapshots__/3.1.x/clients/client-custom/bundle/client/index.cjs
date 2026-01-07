
//#region src/core/auth.ts
const getAuthToken = async (auth, callback) => {
	const token = typeof callback === "function" ? await callback(auth) : callback;
	if (!token) return;
	if (auth.scheme === "bearer") return `Bearer ${token}`;
	if (auth.scheme === "basic") return `Basic ${btoa(token)}`;
	return token;
};

//#endregion
//#region src/core/bodySerializer.ts
const serializeFormDataPair = (data, key, value) => {
	if (typeof value === "string" || value instanceof Blob) data.append(key, value);
	else data.append(key, JSON.stringify(value));
};
const serializeUrlSearchParamsPair = (data, key, value) => {
	if (typeof value === "string") data.append(key, value);
	else data.append(key, JSON.stringify(value));
};
const formDataBodySerializer = { bodySerializer: (body) => {
	const data = new FormData();
	Object.entries(body).forEach(([key, value]) => {
		if (value === void 0 || value === null) return;
		if (Array.isArray(value)) value.forEach((v) => serializeFormDataPair(data, key, v));
		else serializeFormDataPair(data, key, value);
	});
	return data;
} };
const jsonBodySerializer = { bodySerializer: (body) => JSON.stringify(body, (_key, value) => typeof value === "bigint" ? value.toString() : value) };
const urlSearchParamsBodySerializer = { bodySerializer: (body) => {
	const data = new URLSearchParams();
	Object.entries(body).forEach(([key, value]) => {
		if (value === void 0 || value === null) return;
		if (Array.isArray(value)) value.forEach((v) => serializeUrlSearchParamsPair(data, key, v));
		else serializeUrlSearchParamsPair(data, key, value);
	});
	return data.toString();
} };

//#endregion
//#region src/core/pathSerializer.ts
const separatorArrayExplode = (style) => {
	switch (style) {
		case "label": return ".";
		case "matrix": return ";";
		case "simple": return ",";
		default: return "&";
	}
};
const separatorArrayNoExplode = (style) => {
	switch (style) {
		case "form": return ",";
		case "pipeDelimited": return "|";
		case "spaceDelimited": return "%20";
		default: return ",";
	}
};
const separatorObjectExplode = (style) => {
	switch (style) {
		case "label": return ".";
		case "matrix": return ";";
		case "simple": return ",";
		default: return "&";
	}
};
const serializeArrayParam = ({ allowReserved, explode, name, style, value }) => {
	if (!explode) {
		const joinedValues$1 = (allowReserved ? value : value.map((v) => encodeURIComponent(v))).join(separatorArrayNoExplode(style));
		switch (style) {
			case "label": return `.${joinedValues$1}`;
			case "matrix": return `;${name}=${joinedValues$1}`;
			case "simple": return joinedValues$1;
			default: return `${name}=${joinedValues$1}`;
		}
	}
	const separator = separatorArrayExplode(style);
	const joinedValues = value.map((v) => {
		if (style === "label" || style === "simple") return allowReserved ? v : encodeURIComponent(v);
		return serializePrimitiveParam({
			allowReserved,
			name,
			value: v
		});
	}).join(separator);
	return style === "label" || style === "matrix" ? separator + joinedValues : joinedValues;
};
const serializePrimitiveParam = ({ allowReserved, name, value }) => {
	if (value === void 0 || value === null) return "";
	if (typeof value === "object") throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
	return `${name}=${allowReserved ? value : encodeURIComponent(value)}`;
};
const serializeObjectParam = ({ allowReserved, explode, name, style, value, valueOnly }) => {
	if (value instanceof Date) return valueOnly ? value.toISOString() : `${name}=${value.toISOString()}`;
	if (style !== "deepObject" && !explode) {
		let values = [];
		Object.entries(value).forEach(([key, v]) => {
			values = [
				...values,
				key,
				allowReserved ? v : encodeURIComponent(v)
			];
		});
		const joinedValues$1 = values.join(",");
		switch (style) {
			case "form": return `${name}=${joinedValues$1}`;
			case "label": return `.${joinedValues$1}`;
			case "matrix": return `;${name}=${joinedValues$1}`;
			default: return joinedValues$1;
		}
	}
	const separator = separatorObjectExplode(style);
	const joinedValues = Object.entries(value).map(([key, v]) => serializePrimitiveParam({
		allowReserved,
		name: style === "deepObject" ? `${name}[${key}]` : key,
		value: v
	})).join(separator);
	return style === "label" || style === "matrix" ? separator + joinedValues : joinedValues;
};

//#endregion
//#region src/utils.ts
const PATH_PARAM_RE = /\{[^{}]+\}/g;
const defaultPathSerializer = ({ path, url: _url }) => {
	let url = _url;
	const matches = _url.match(PATH_PARAM_RE);
	if (matches) for (const match of matches) {
		let explode = false;
		let name = match.substring(1, match.length - 1);
		let style = "simple";
		if (name.endsWith("*")) {
			explode = true;
			name = name.substring(0, name.length - 1);
		}
		if (name.startsWith(".")) {
			name = name.substring(1);
			style = "label";
		} else if (name.startsWith(";")) {
			name = name.substring(1);
			style = "matrix";
		}
		const value = path[name];
		if (value === void 0 || value === null) continue;
		if (Array.isArray(value)) {
			url = url.replace(match, serializeArrayParam({
				explode,
				name,
				style,
				value
			}));
			continue;
		}
		if (typeof value === "object") {
			url = url.replace(match, serializeObjectParam({
				explode,
				name,
				style,
				value,
				valueOnly: true
			}));
			continue;
		}
		if (style === "matrix") {
			url = url.replace(match, `;${serializePrimitiveParam({
				name,
				value
			})}`);
			continue;
		}
		const replaceValue = encodeURIComponent(style === "label" ? `.${value}` : value);
		url = url.replace(match, replaceValue);
	}
	return url;
};
const createQuerySerializer = ({ allowReserved, array, object } = {}) => {
	const querySerializer = (queryParams) => {
		const search = [];
		if (queryParams && typeof queryParams === "object") for (const name in queryParams) {
			const value = queryParams[name];
			if (value === void 0 || value === null) continue;
			if (Array.isArray(value)) {
				const serializedArray = serializeArrayParam({
					allowReserved,
					explode: true,
					name,
					style: "form",
					value,
					...array
				});
				if (serializedArray) search.push(serializedArray);
			} else if (typeof value === "object") {
				const serializedObject = serializeObjectParam({
					allowReserved,
					explode: true,
					name,
					style: "deepObject",
					value,
					...object
				});
				if (serializedObject) search.push(serializedObject);
			} else {
				const serializedPrimitive = serializePrimitiveParam({
					allowReserved,
					name,
					value
				});
				if (serializedPrimitive) search.push(serializedPrimitive);
			}
		}
		return search.join("&");
	};
	return querySerializer;
};
/**
* Infers parseAs value from provided Content-Type header.
*/
const getParseAs = (contentType) => {
	if (!contentType) return "stream";
	const cleanContent = contentType.split(";")[0]?.trim();
	if (!cleanContent) return;
	if (cleanContent.startsWith("application/json") || cleanContent.endsWith("+json")) return "json";
	if (cleanContent === "multipart/form-data") return "formData";
	if ([
		"application/",
		"audio/",
		"image/",
		"video/"
	].some((type) => cleanContent.startsWith(type))) return "blob";
	if (cleanContent.startsWith("text/")) return "text";
};
const checkForExistence = (options, name) => {
	if (!name) return false;
	if (options.headers.has(name) || options.query?.[name] || options.headers.get("Cookie")?.includes(`${name}=`)) return true;
	return false;
};
const setAuthParams = async ({ security, ...options }) => {
	for (const auth of security) {
		if (checkForExistence(options, auth.name)) continue;
		const token = await getAuthToken(auth, options.auth);
		if (!token) continue;
		const name = auth.name ?? "Authorization";
		switch (auth.in) {
			case "query":
				if (!options.query) options.query = {};
				options.query[name] = token;
				break;
			case "cookie":
				options.headers.append("Cookie", `${name}=${token}`);
				break;
			case "header":
			default:
				options.headers.set(name, token);
				break;
		}
	}
};
const buildUrl = (options) => {
	return getUrl({
		baseUrl: options.baseUrl,
		path: options.path,
		query: options.query,
		querySerializer: typeof options.querySerializer === "function" ? options.querySerializer : createQuerySerializer(options.querySerializer),
		url: options.url
	});
};
const getUrl = ({ baseUrl, path, query, querySerializer, url: _url }) => {
	const pathUrl = _url.startsWith("/") ? _url : `/${_url}`;
	let url = (baseUrl ?? "") + pathUrl;
	if (path) url = defaultPathSerializer({
		path,
		url
	});
	let search = query ? querySerializer(query) : "";
	if (search.startsWith("?")) search = search.substring(1);
	if (search) url += `?${search}`;
	return url;
};
const mergeConfigs = (a, b) => {
	const config = {
		...a,
		...b
	};
	if (config.baseUrl?.endsWith("/")) config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
	config.headers = mergeHeaders(a.headers, b.headers);
	return config;
};
const mergeHeaders = (...headers) => {
	const mergedHeaders = new Headers();
	for (const header of headers) {
		if (!header || typeof header !== "object") continue;
		const iterator = header instanceof Headers ? header.entries() : Object.entries(header);
		for (const [key, value] of iterator) if (value === null) mergedHeaders.delete(key);
		else if (Array.isArray(value)) for (const v of value) mergedHeaders.append(key, v);
		else if (value !== void 0) mergedHeaders.set(key, typeof value === "object" ? JSON.stringify(value) : value);
	}
	return mergedHeaders;
};
var Interceptors = class {
	fns = [];
	clear() {
		this.fns = [];
	}
	eject(id) {
		const index = this.getInterceptorIndex(id);
		if (this.fns[index]) this.fns[index] = null;
	}
	exists(id) {
		const index = this.getInterceptorIndex(id);
		return Boolean(this.fns[index]);
	}
	getInterceptorIndex(id) {
		if (typeof id === "number") return this.fns[id] ? id : -1;
		return this.fns.indexOf(id);
	}
	update(id, fn) {
		const index = this.getInterceptorIndex(id);
		if (this.fns[index]) {
			this.fns[index] = fn;
			return id;
		}
		return false;
	}
	use(fn) {
		this.fns.push(fn);
		return this.fns.length - 1;
	}
};
const createInterceptors = () => ({
	error: new Interceptors(),
	request: new Interceptors(),
	response: new Interceptors()
});
const defaultQuerySerializer = createQuerySerializer({
	allowReserved: false,
	array: {
		explode: true,
		style: "form"
	},
	object: {
		explode: true,
		style: "deepObject"
	}
});
const defaultHeaders = { "Content-Type": "application/json" };
const createConfig = (override = {}) => ({
	...jsonBodySerializer,
	headers: defaultHeaders,
	parseAs: "auto",
	querySerializer: defaultQuerySerializer,
	...override
});

//#endregion
//#region src/client.ts
const createClient = (config = {}) => {
	let _config = mergeConfigs(createConfig(), config);
	const getConfig = () => ({ ..._config });
	const setConfig = (config$1) => {
		_config = mergeConfigs(_config, config$1);
		return getConfig();
	};
	const interceptors = createInterceptors();
	const request = async (options) => {
		const opts = {
			..._config,
			...options,
			fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
			headers: mergeHeaders(_config.headers, options.headers)
		};
		if (opts.security) await setAuthParams({
			...opts,
			security: opts.security
		});
		if (opts.requestValidator) await opts.requestValidator(opts);
		if (opts.body && opts.bodySerializer) opts.body = opts.bodySerializer(opts.body);
		if (opts.body === void 0 || opts.body === "") opts.headers.delete("Content-Type");
		const url = buildUrl(opts);
		const requestInit = {
			redirect: "follow",
			...opts
		};
		let request$1 = new Request(url, requestInit);
		for (const fn of interceptors.request.fns) if (fn) request$1 = await fn(request$1, opts);
		const _fetch = opts.fetch;
		let response = await _fetch(request$1);
		for (const fn of interceptors.response.fns) if (fn) response = await fn(response, request$1, opts);
		const result = {
			request: request$1,
			response
		};
		if (response.ok) {
			if (response.status === 204 || response.headers.get("Content-Length") === "0") return {
				data: {},
				...result
			};
			const parseAs = (opts.parseAs === "auto" ? getParseAs(response.headers.get("Content-Type")) : opts.parseAs) ?? "json";
			let data;
			switch (parseAs) {
				case "arrayBuffer":
				case "blob":
				case "formData":
				case "json":
				case "text":
					data = await response[parseAs]();
					break;
				case "stream": return {
					data: response.body,
					...result
				};
			}
			if (parseAs === "json") {
				if (opts.responseValidator) await opts.responseValidator(data);
				if (opts.responseTransformer) data = await opts.responseTransformer(data);
			}
			return {
				data,
				...result
			};
		}
		let error = await response.text();
		try {
			error = JSON.parse(error);
		} catch {}
		let finalError = error;
		for (const fn of interceptors.error.fns) if (fn) finalError = await fn(error, response, request$1, opts);
		finalError = finalError || {};
		if (opts.throwOnError) throw finalError;
		return {
			error: finalError,
			...result
		};
	};
	return {
		buildUrl,
		connect: (options) => request({
			...options,
			method: "CONNECT"
		}),
		delete: (options) => request({
			...options,
			method: "DELETE"
		}),
		get: (options) => request({
			...options,
			method: "GET"
		}),
		getConfig,
		head: (options) => request({
			...options,
			method: "HEAD"
		}),
		interceptors,
		options: (options) => request({
			...options,
			method: "OPTIONS"
		}),
		patch: (options) => request({
			...options,
			method: "PATCH"
		}),
		post: (options) => request({
			...options,
			method: "POST"
		}),
		put: (options) => request({
			...options,
			method: "PUT"
		}),
		request,
		setConfig,
		trace: (options) => request({
			...options,
			method: "TRACE"
		})
	};
};

//#endregion
//#region src/core/params.ts
const extraPrefixes = Object.entries({
	$body_: "body",
	$headers_: "headers",
	$path_: "path",
	$query_: "query"
});
const buildKeyMap = (fields, map) => {
	if (!map) map = /* @__PURE__ */ new Map();
	for (const config of fields) if ("in" in config) {
		if (config.key) map.set(config.key, {
			in: config.in,
			map: config.map
		});
	} else if (config.args) buildKeyMap(config.args, map);
	return map;
};
const stripEmptySlots = (params) => {
	for (const [slot, value] of Object.entries(params)) if (value && typeof value === "object" && !Object.keys(value).length) delete params[slot];
};
const buildClientParams = (args, fields) => {
	const params = {
		body: {},
		headers: {},
		path: {},
		query: {}
	};
	const map = buildKeyMap(fields);
	let config;
	for (const [index, arg] of args.entries()) {
		if (fields[index]) config = fields[index];
		if (!config) continue;
		if ("in" in config) if (config.key) {
			const field = map.get(config.key);
			const name = field.map || config.key;
			params[field.in][name] = arg;
		} else params.body = arg;
		else for (const [key, value] of Object.entries(arg ?? {})) {
			const field = map.get(key);
			if (field) {
				const name = field.map || key;
				params[field.in][name] = value;
			} else {
				const extra = extraPrefixes.find(([prefix]) => key.startsWith(prefix));
				if (extra) {
					const [prefix, slot] = extra;
					params[slot][key.slice(prefix.length)] = value;
				} else for (const [slot, allowed] of Object.entries(config.allowExtra ?? {})) if (allowed) {
					params[slot][key] = value;
					break;
				}
			}
		}
	}
	stripEmptySlots(params);
	return params;
};

//#endregion
exports.buildClientParams = buildClientParams;
exports.createClient = createClient;
exports.createConfig = createConfig;
exports.formDataBodySerializer = formDataBodySerializer;
exports.jsonBodySerializer = jsonBodySerializer;
exports.urlSearchParamsBodySerializer = urlSearchParamsBodySerializer;
//# sourceMappingURL=index.cjs.map
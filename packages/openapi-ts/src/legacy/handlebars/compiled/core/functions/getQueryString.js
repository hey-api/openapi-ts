export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const getQueryString = (params: Record<string, unknown>): string => {\n	const qs: string[] = [];\n\n	const append = (key: string, value: unknown) => {\n		qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n	};\n\n	const encodePair = (key: string, value: unknown) => {\n		if (value === undefined || value === null) {\n			return;\n		}\n\n		if (value instanceof Date) {\n			append(key, value.toISOString());\n		} else if (Array.isArray(value)) {\n			value.forEach(v => encodePair(key, v));\n		} else if (typeof value === 'object') {\n			Object.entries(value).forEach(([k, v]) => encodePair(`${key}[${k}]`, v));\n		} else {\n			append(key, value);\n		}\n	};\n\n	Object.entries(params).forEach(([key, value]) => encodePair(key, value));\n\n	return qs.length ? `?${qs.join('&')}` : '';\n};";
  },
  useData: true,
};

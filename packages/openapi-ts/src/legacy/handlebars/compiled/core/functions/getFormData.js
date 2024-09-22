export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return 'export const getFormData = (options: ApiRequestOptions): FormData | undefined => {\n	if (options.formData) {\n		const formData = new FormData();\n\n		const process = (key: string, value: unknown) => {\n			if (isString(value) || isBlob(value)) {\n				formData.append(key, value);\n			} else {\n				formData.append(key, JSON.stringify(value));\n			}\n		};\n\n		Object.entries(options.formData)\n			.filter(([, value]) => value !== undefined && value !== null)\n			.forEach(([key, value]) => {\n				if (Array.isArray(value)) {\n					value.forEach(v => process(key, v));\n				} else {\n					process(key, value);\n				}\n			});\n\n		return formData;\n	}\n	return undefined;\n};';
  },
  useData: true,
};

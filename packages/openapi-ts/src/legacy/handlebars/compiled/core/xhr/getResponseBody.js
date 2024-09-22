export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const getResponseBody = (xhr: XMLHttpRequest): unknown => {\n	if (xhr.status !== 204) {\n		try {\n			const contentType = xhr.getResponseHeader('Content-Type');\n			if (contentType) {\n				if (contentType.includes('application/json') || contentType.includes('+json')) {\n					return JSON.parse(xhr.responseText);\n				} else {\n					return xhr.responseText;\n				}\n			}\n		} catch (error) {\n			console.error(error);\n		}\n	}\n	return undefined;\n};";
  },
  useData: true,
};

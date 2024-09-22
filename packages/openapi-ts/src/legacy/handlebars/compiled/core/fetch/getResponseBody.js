export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "export const getResponseBody = async (response: Response): Promise<unknown> => {\n	if (response.status !== 204) {\n		try {\n			const contentType = response.headers.get('Content-Type');\n			if (contentType) {\n				const binaryTypes = ['application/octet-stream', 'application/pdf', 'application/zip', 'audio/', 'image/', 'video/'];\n				if (contentType.includes('application/json') || contentType.includes('+json')) {\n					return await response.json();\n				} else if (binaryTypes.some(type => contentType.includes(type))) {\n					return await response.blob();\n				} else if (contentType.includes('multipart/form-data')) {\n					return await response.formData();\n				} else if (contentType.includes('text/')) {\n					return await response.text();\n				}\n			}\n		} catch (error) {\n			console.error(error);\n		}\n	}\n	return undefined;\n};";
  },
  useData: true,
};

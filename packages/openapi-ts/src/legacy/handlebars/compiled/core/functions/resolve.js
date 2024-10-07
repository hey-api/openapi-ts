export default {
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    return "type Resolver<T> = (options: ApiRequestOptions<T>) => Promise<T>;\n\nexport const resolve = async <T>(options: ApiRequestOptions<T>, resolver?: T | Resolver<T>): Promise<T | undefined> => {\n	if (typeof resolver === 'function') {\n		return (resolver as Resolver<T>)(options);\n	}\n	return resolver;\n};";
  },
  useData: true,
};

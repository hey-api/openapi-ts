import type { QuerySerializer } from '../../client-core/bundle/bodySerializer';

describe('buildUrl', () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it.each([
    {
      description: 'with query params',
      expectedUrl: '/some-url?param1=some-query-param',
      inputOptions: {
        baseUrl: 'some-base-url',
        path: { param1: 'some-path-param' },
        query: { param1: 'some-query-param' },
        querySerializer: (() => 'param1=some-query-param') as QuerySerializer,
        url: '/some-url',
      },
    },
    {
      description: 'without query params',
      expectedUrl: '/some-url',
      inputOptions: {
        baseURL: 'some-base-url',
        path: { param1: 'some-path-param' },
        query: undefined,
        querySerializer: (() => '') as QuerySerializer,
        url: '/some-url',
      },
    },
  ])(
    'passes correct parameters to getUrl $description',
    async ({ expectedUrl, inputOptions }) => {
      const getUrlMock = vi.fn().mockReturnValue(expectedUrl);
      vi.doMock('../../client-core/bundle/utils', async () => ({
        getUrl: getUrlMock,
      }));

      const { buildUrl } = await import('../bundle/utils');

      const builtUrl = buildUrl(inputOptions);

      expect(builtUrl).toBe(expectedUrl);

      expect(getUrlMock).toHaveBeenCalledExactlyOnceWith({
        baseUrl: inputOptions.baseURL,
        path: inputOptions.path,
        query: inputOptions.query,
        querySerializer: inputOptions.querySerializer,
        url: inputOptions.url,
      });
    },
  );
});

import * as refParser from '@hey-api/json-schema-ref-parser';

import { getSpec } from '../getSpec';

vi.mock('@hey-api/json-schema-ref-parser', () => ({
  getResolvedInput: vi.fn(({ pathOrUrlOrSchema }: { pathOrUrlOrSchema: string }) => ({
    path: pathOrUrlOrSchema,
    schema: undefined,
    type: 'url',
  })),
  sendRequest: vi.fn(),
}));

const mockSendRequest = vi.mocked(refParser.sendRequest);

describe('getSpec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL input', () => {
    it('returns error with status 500 and error message when GET request throws an exception', async () => {
      mockSendRequest.mockRejectedValueOnce(new Error('fetch failed'));

      const result = await getSpec({
        fetchOptions: undefined,
        inputPath: 'http://example.com/openapi.json',
        timeout: undefined,
        watch: { headers: new Headers() },
      });

      expect(result.error).toBe('not-ok');
      expect(result.response!.status).toBe(500);
      expect(await result.response!.text()).toBe('fetch failed');
    });

    it('returns error with status 500 and string message when non-Error is thrown during GET request', async () => {
      mockSendRequest.mockRejectedValueOnce('network unavailable');

      const result = await getSpec({
        fetchOptions: undefined,
        inputPath: 'http://example.com/openapi.json',
        timeout: undefined,
        watch: { headers: new Headers() },
      });

      expect(result.error).toBe('not-ok');
      expect(result.response!.status).toBe(500);
      expect(await result.response!.text()).toBe('network unavailable');
    });

    it('returns error when GET response has status >= 300', async () => {
      mockSendRequest.mockResolvedValueOnce({
        response: new Response(null, { status: 404, statusText: 'Not Found' }),
      });

      const result = await getSpec({
        fetchOptions: undefined,
        inputPath: 'http://example.com/openapi.json',
        timeout: undefined,
        watch: { headers: new Headers() },
      });

      expect(result.error).toBe('not-ok');
      expect(result.response!.status).toBe(404);
    });

    it('returns error with status 500 and error message when HEAD request throws an exception', async () => {
      mockSendRequest.mockRejectedValueOnce(new Error('connection refused'));

      const result = await getSpec({
        fetchOptions: undefined,
        inputPath: 'http://example.com/openapi.json',
        timeout: undefined,
        watch: { headers: new Headers(), isHeadMethodSupported: true, lastValue: 'previous' },
      });

      expect(result.error).toBe('not-ok');
      expect(result.response!.status).toBe(500);
      expect(await result.response!.text()).toBe('connection refused');
    });

    it('returns arrayBuffer on successful GET', async () => {
      const content = '{"openapi":"3.0.0"}';
      const encoder = new TextEncoder();
      const buffer = encoder.encode(content).buffer as ArrayBuffer;

      mockSendRequest.mockResolvedValueOnce({
        response: new Response(buffer, { status: 200 }),
      });

      const result = await getSpec({
        fetchOptions: undefined,
        inputPath: 'http://example.com/openapi.json',
        timeout: undefined,
        watch: { headers: new Headers() },
      });

      expect(result.error).toBeUndefined();
      expect(result.arrayBuffer).toBeDefined();
    });
  });
});

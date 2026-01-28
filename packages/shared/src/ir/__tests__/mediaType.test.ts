import type { IRMediaType } from '../mediaType';
import { isMediaTypeFileLike, mediaTypeToIrMediaType } from '../mediaType';

describe('isMediaTypeFileLike', () => {
  const scenarios: Array<{
    mediaType: string;
    response: boolean;
  }> = [
    {
      mediaType: 'application/json',
      response: false,
    },
    {
      mediaType: 'application/json+download',
      response: true,
    },
    {
      mediaType: 'application/json; charset=ascii',
      response: false,
    },
    {
      mediaType: 'application/octet-stream',
      response: true,
    },
    {
      mediaType: 'application/pdf',
      response: true,
    },
    {
      mediaType: 'application/xml; charset=utf-8',
      response: true,
    },
    {
      mediaType: 'application/zip',
      response: true,
    },
    {
      mediaType: 'image/jpeg',
      response: false,
    },
    {
      mediaType: 'image/jpeg; charset=utf-8',
      response: false,
    },
    {
      mediaType: 'text/html; charset=utf-8',
      response: false,
    },
    {
      mediaType: 'text/javascript; charset=ISO-8859-1',
      response: true,
    },
    {
      mediaType: 'text/plain; charset=utf-8',
      response: false,
    },
    {
      mediaType: 'video/mp4',
      response: true,
    },
  ];

  it.each(scenarios)(
    'detects $mediaType as file-like? $response',
    async ({ mediaType, response }) => {
      expect(isMediaTypeFileLike({ mediaType })).toEqual(response);
    },
  );
});

describe('mediaTypeToIrMediaType', () => {
  const scenarios: Array<{
    mediaType: string;
    response: IRMediaType | undefined;
  }> = [
    {
      mediaType: 'multipart/form-data',
      response: 'form-data',
    },
    {
      mediaType: 'application/json',
      response: 'json',
    },
    {
      mediaType: 'text/plain; charset=utf-8',
      response: 'text',
    },
    {
      mediaType: 'application/x-www-form-urlencoded',
      response: 'url-search-params',
    },
    {
      mediaType: 'application/octet-stream',
      response: 'octet-stream',
    },
    {
      mediaType: 'application/foo',
      response: undefined,
    },
  ];

  it.each(scenarios)(
    'ir media type for $mediaType: $response',
    async ({ mediaType, response }) => {
      expect(mediaTypeToIrMediaType({ mediaType })).toEqual(response);
    },
  );
});

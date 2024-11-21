import { describe, expect, it } from 'vitest';

import { isMediaTypeFileLike } from '../mediaType';

describe('isMediaTypeFileLike', () => {
  const scenarios: Array<{
    fileLike: ReturnType<typeof isMediaTypeFileLike>;
    mediaType: Parameters<typeof isMediaTypeFileLike>[0]['mediaType'];
  }> = [
    {
      fileLike: false,
      mediaType: 'application/json',
    },
    {
      fileLike: true,
      mediaType: 'application/json+download',
    },
    {
      fileLike: false,
      mediaType: 'application/json; charset=ascii',
    },
    {
      fileLike: true,
      mediaType: 'application/octet-stream',
    },
    {
      fileLike: true,
      mediaType: 'application/pdf',
    },
    {
      fileLike: true,
      mediaType: 'application/xml; charset=utf-8',
    },
    {
      fileLike: true,
      mediaType: 'application/zip',
    },
    {
      fileLike: false,
      mediaType: 'image/jpeg',
    },
    {
      fileLike: false,
      mediaType: 'image/jpeg; charset=utf-8',
    },
    {
      fileLike: false,
      mediaType: 'text/html; charset=utf-8',
    },
    {
      fileLike: true,
      mediaType: 'text/javascript; charset=ISO-8859-1',
    },
    {
      fileLike: true,
      mediaType: 'text/plain; charset=utf-8',
    },
    {
      fileLike: true,
      mediaType: 'video/mp4',
    },
  ];

  it.each(scenarios)(
    'detects $mediaType as file-like? $fileLike',
    async ({ fileLike, mediaType }) => {
      expect(isMediaTypeFileLike({ mediaType })).toEqual(fileLike);
    },
  );
});

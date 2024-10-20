const jsonMimeRegExp = /^application\/(.*\+)?json(;.*)?$/i;
const multipartFormDataMimeRegExp = /^multipart\/form-data(;.*)?$/i;
const xWwwFormUrlEncodedMimeRegExp =
  /^application\/x-www-form-urlencoded(;.*)?$/i;

export type IRMediaType = 'form-data' | 'json' | 'url-search-params';

export const mediaTypeToIrMediaType = ({
  mediaType,
}: {
  mediaType: string;
}): IRMediaType | undefined => {
  jsonMimeRegExp.lastIndex = 0;
  if (jsonMimeRegExp.test(mediaType)) {
    return 'json';
  }

  multipartFormDataMimeRegExp.lastIndex = 0;
  if (multipartFormDataMimeRegExp.test(mediaType)) {
    return 'form-data';
  }

  xWwwFormUrlEncodedMimeRegExp.lastIndex = 0;
  if (xWwwFormUrlEncodedMimeRegExp.test(mediaType)) {
    return 'url-search-params';
  }
};

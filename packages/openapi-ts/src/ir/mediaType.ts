const fileLikeRegExp =
  /^(application\/(pdf|rtf|msword|vnd\.(ms-|openxmlformats-officedocument\.)|zip|x-(7z|tar|rar|zip|iso)|octet-stream|gzip|x-msdownload|json\+download|xml|x-yaml|x-7z-compressed|x-tar)|text\/(plain|yaml|css|javascript)|audio\/(mpeg|wav)|video\/(mp4|x-matroska)|image\/(vnd\.adobe\.photoshop|svg\+xml))(; ?charset=[^;]+)?$/i;
const jsonMimeRegExp = /^application\/(.*\+)?json(;.*)?$/i;
const multipartFormDataMimeRegExp = /^multipart\/form-data(;.*)?$/i;
const xWwwFormUrlEncodedMimeRegExp =
  /^application\/x-www-form-urlencoded(;.*)?$/i;

export type IRMediaType = 'form-data' | 'json' | 'url-search-params';

export const isMediaTypeFileLike = ({
  mediaType,
}: {
  mediaType: string;
}): boolean => {
  fileLikeRegExp.lastIndex = 0;
  return fileLikeRegExp.test(mediaType);
};

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

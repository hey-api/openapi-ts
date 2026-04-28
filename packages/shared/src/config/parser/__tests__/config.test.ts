import { getParser } from '../config';

describe('getParser', () => {
  it('maps readWrite request/response booleans to per-variant enabled flags', () => {
    const parser = getParser({
      parser: {
        transforms: {
          readWrite: {
            requests: false,
            responses: false,
          },
        },
      },
    });

    expect(parser.transforms.readWrite.enabled).toBe(true);
    expect(parser.transforms.readWrite.requests.enabled).toBe(false);
    expect(parser.transforms.readWrite.responses.enabled).toBe(false);
  });

  it('keeps defaults when readWrite requests/responses are not provided', () => {
    const parser = getParser({
      parser: {
        transforms: {
          readWrite: {},
        },
      },
    });

    expect(parser.transforms.readWrite.requests.enabled).toBe(true);
    expect(parser.transforms.readWrite.responses.enabled).toBe(true);
    expect(parser.transforms.readWrite.requests.name).toBe('{{name}}Writable');
    expect(parser.transforms.readWrite.responses.name).toBe('{{name}}');
  });
});

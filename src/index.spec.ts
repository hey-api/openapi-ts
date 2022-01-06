import OpenAPI from './index';

describe('index', () => {
    it('parses v2 without issues', async () => {
        await OpenAPI.generate({
            input: './test/spec/v2.json',
            output: './generated/v2/',
            write: false,
        });
    });

    it('parses v3 without issues', async () => {
        await OpenAPI.generate({
            input: './test/spec/v3.json',
            output: './generated/v3/',
            write: false,
        });
    });

    it('downloads and parses v2 without issues', async () => {
        await OpenAPI.generate({
            input: 'https://raw.githubusercontent.com/ferdikoomen/openapi-typescript-codegen/master/test/spec/v2.json',
            output: './generated/v2-downloaded/',
            write: false,
        });
    });

    it('downloads and parses v3 without issues', async () => {
        await OpenAPI.generate({
            input: 'https://raw.githubusercontent.com/ferdikoomen/openapi-typescript-codegen/master/test/spec/v3.json',
            output: './generated/v3-downloaded/',
            write: false,
        });
    });
});

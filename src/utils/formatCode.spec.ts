import { formatCode } from './formatCode';

const input1 = `{ foo: true }`;

const output1 = `{ foo: true }`;

const input2 = `{ foo: true, bar: 123 }`;

const output2 = `{ foo: true, bar: 123 }`;

const input3 = `{
foo: true,
bar: 123
}`;

const output3 = `{
\tfoo: true,
\tbar: 123
}`;

const input4 = `{
\t\t\t\tfoo: true,
\t\t\t\tbar: 123
}`;

const output4 = `{
\tfoo: true,
\tbar: 123
}`;

describe('format', () => {
    it('should produce correct result', () => {
        expect(formatCode(``)).toEqual('');
        expect(formatCode(`{}`)).toEqual('{}');
        expect(formatCode(input1)).toEqual(output1);
        expect(formatCode(input2)).toEqual(output2);
        expect(formatCode(input3)).toEqual(output3);
        expect(formatCode(input4)).toEqual(output4);
    });
});

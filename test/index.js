'use strict';

const OpenAPI = require('../dist');

async function generateV2() {
    await OpenAPI.generate({
        input: './test/spec/v2.json',
        output: './test/generated/v2/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        request: './test/custom/request.ts',
    });
}

async function generateV3() {
    await OpenAPI.generate({
        input: './test/spec/v3.json',
        output: './test/generated/v3/',
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        request: './test/custom/request.ts',
    });
}

async function generate() {
    await generateV2();
    await generateV3();
}

generate();

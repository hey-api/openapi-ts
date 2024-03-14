'use strict';

const OpenAPI = require('../');
const fetch = require('node-fetch');

const generate = async (input, output) => {
    await OpenAPI.generate({
        autoformat: false,
        // clientName: 'Demo',
        exportCore: true,
        exportModels: true,
        exportSchemas: true,
        exportServices: true,
        httpClient: 'fetch',
        // indent: '2',
        input,
        output,
        // postfixServices: 'Service',
        postfixModels: '',
        // request: './test/custom/request.ts',
        serviceResponse: 'body',
        useDateType: false,
        useOptions: true,
    });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateRealWorldSpecs = async () => {
    const response = await fetch('https://api.apis.guru/v2/list.json');

    const list = await response.json();
    delete list['api.video'];
    delete list['apideck.com:vault'];
    delete list['amazonaws.com:mediaconvert'];
    delete list['bungie.net'];
    delete list['docusign.net'];
    delete list['googleapis.com:adsense'];
    delete list['googleapis.com:servicebroker'];
    delete list['kubernetes.io'];
    delete list['microsoft.com:graph'];
    delete list['presalytics.io:ooxml'];
    delete list['stripe.com'];

    const specs = Object.entries(list).map(([name, api]) => {
        const latestVersion = api.versions[api.preferred];
        return {
            name: name
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim()
                .toLowerCase(),
            url: latestVersion.swaggerYamlUrl || latestVersion.swaggerUrl,
        };
    });

    for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        await generate(spec.url, `./test/generated/${spec.name}/`);
    }
};

const main = async () => {
    await generate('./test/spec/v2.json', './test/generated/v2/');
    await generate('./test/spec/v3.json', './test/generated/v3/');
    // await generateRealWorldSpecs();
};

main();

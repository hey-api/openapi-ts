import fs from 'node:fs';
import path from 'node:path';

import Fastify from 'fastify';
import glue from 'fastify-openapi-glue';

import { serviceHandlers } from './handlers';

export const buildServer = async () => {
  const fastify = Fastify();

  const specificationPath = path.join(import.meta.dirname, '..', 'openapi.json');
  const specificationJson = JSON.parse(fs.readFileSync(specificationPath, 'utf-8'));

  fastify.register(glue, {
    prefix: 'v3',
    serviceHandlers,
    specification: specificationJson,
  });

  return fastify;
};

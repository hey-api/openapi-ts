import Fastify from 'fastify';
import glue from 'fastify-openapi-glue';

import { serviceHandlers } from './handlers';

export const buildServer = () => {
  const fastify = Fastify();

  const specification = fetch(
    'https://gist.githubusercontent.com/seriousme/55bd4c8ba2e598e416bb5543dcd362dc/raw/cf0b86ba37bb54bf1a6bf047c0ecf2a0ce4c62e0/petstore-v3.1.json',
  )
    .then((reply) => reply.json())
    .then((data) => data);
  console.log(specification);

  fastify.register(glue, {
    prefix: 'v3',
    serviceHandlers,
    specification,
  });

  return fastify;
};

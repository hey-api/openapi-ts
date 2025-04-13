import { buildServer } from './server';

buildServer().then((fastify) => {
  fastify.listen({ port: 3000 }, function (err) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
});

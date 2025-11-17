import type { RouteHandlers } from './client/fastify.gen';

export const serviceHandlers: RouteHandlers = {
  createPets(request, reply) {
    reply.code(201).send();
  },

  listPets(request, reply) {
    reply.code(200).send([]);
  },
  showPetById(request, reply) {
    reply.code(200).send({
      id: Number(request.params.petId),
      name: 'Kitty',
    });
  },
};

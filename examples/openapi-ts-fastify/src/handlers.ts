import type { Pet, RouteHandlers } from './client/fastify.gen';

export const serviceHandlers: Pick<RouteHandlers, 'showPetById'> = {
  showPetById(request, reply) {
    const {
      params: { petId },
    } = request;
    const pet: Pet = {
      id: Number(petId),
      name: 'petname',
    };
    reply.code(200).send(pet);
  },
};

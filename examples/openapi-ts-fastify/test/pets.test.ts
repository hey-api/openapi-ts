import { type FastifyInstance } from 'fastify';
import { showPetById } from 'src/client';
import { client } from 'src/client/client.gen';
import { buildServer } from 'src/server';

describe('/pet/findByTags', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
    await server.listen();

    // @ts-ignore
    const baseUrl = `http://localhost:${server.server.address().port}/v3`;
    client.setConfig({ baseUrl });
  });

  afterAll(async () => {
    await Promise.all([server.close()]);
  });

  test('showPetById', async () => {
    const result = await showPetById({
      client,
      path: {
        petId: '123',
      },
    });
    expect(result.response.status).toBe(200);
  });
});

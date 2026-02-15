import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { showPetById } from 'src/client';
import { client } from 'src/client/client.gen';

describe('PetsController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
    const baseUrl = `http://localhost:${address.port}`;
    client.setConfig({ baseUrl });
  });

  afterAll(async () => {
    await app.close();
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

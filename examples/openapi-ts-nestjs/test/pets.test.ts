import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { createPet, getInventory, listPets, showPetById } from 'src/client';
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

  test('listPets', async () => {
    const result = await listPets({ client });
    expect(result.response.status).toBe(200);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('showPetById', async () => {
    const result = await showPetById({
      client,
      path: {
        petId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });
    expect(result.response.status).toBe(200);
  });

  test('createPet', async () => {
    const result = await createPet({
      body: { name: 'Buddy' },
      client,
    });
    expect(result.response.status).toBe(201);
  });
});

describe('StoreController', () => {
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

  test('getInventory', async () => {
    const result = await getInventory({ client });
    expect(result.response.status).toBe(200);
  });
});

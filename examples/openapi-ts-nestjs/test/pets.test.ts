import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AddressInfo } from 'net';
import { configureApp } from 'src/app.factory';
import { AppModule } from 'src/app.module';
import { createPet, deletePet, getInventory, listPets, showPetById, updatePet } from 'src/client';
import { client } from 'src/client/client.gen';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = configureApp(moduleRef.createNestApplication());
  await app.init();
  await app.listen(0);

  const address = app.getHttpServer().address() as AddressInfo;
  const baseUrl = `http://localhost:${String(address.port)}`;
  client.setConfig({ baseUrl });
});

afterAll(async () => {
  await app.close();
});

describe('PetsController', () => {
  test('listPets', async () => {
    const result = await listPets({ client });
    expect(result.response.status).toBe(200);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('showPetById', async () => {
    const result = await showPetById({
      client,
      path: { petId: '550e8400-e29b-41d4-a716-446655440000' },
    });
    expect(result.response.status).toBe(200);
  });

  test('createPet', async () => {
    const result = await createPet({
      body: { name: 'Buddy' },
      client,
    });
    expect(result.response.status).toBe(201);
    expect(result.data).toMatchObject({ name: 'Buddy' });
  });

  test('updatePet', async () => {
    const result = await updatePet({
      body: { name: 'Fido Updated' },
      client,
      path: { petId: '550e8400-e29b-41d4-a716-446655440000' },
    });
    expect(result.response.status).toBe(200);
    expect(result.data).toMatchObject({ name: 'Fido Updated' });
  });

  test('deletePet', async () => {
    const result = await deletePet({
      client,
      path: { petId: '550e8400-e29b-41d4-a716-446655440001' },
    });
    expect(result.response.status).toBe(204);
  });
});

describe('StoreController', () => {
  test('getInventory', async () => {
    const result = await getInventory({ client });
    expect(result.response.status).toBe(200);
  });
});

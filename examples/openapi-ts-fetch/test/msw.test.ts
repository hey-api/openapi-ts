import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { client } from '../src/client/client.gen';
import { createMswHandlerFactory } from '../src/client/msw.gen';
import {
  addPet,
  findPetsByStatus,
  getInventory,
  getOrderById,
  getPetById,
  getUserByName,
  uploadFile,
} from '../src/client/sdk.gen';
import type { Pet } from '../src/client/types.gen';

const BASE_URL = 'http://localhost:3000/api/v3';

const createMock = createMswHandlerFactory({ baseUrl: BASE_URL });

const server = setupServer();

beforeAll(() => {
  client.setConfig({ baseUrl: BASE_URL });
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('MSW plugin runtime tests', () => {
  describe('static response value', () => {
    it('returns static response for GET without path params', async () => {
      const mockInventory = { available: 10, pending: 5 };
      server.use(createMock.getInventoryMock({ result: mockInventory, status: 200 }));

      const result = await getInventory({ client });

      expect(result.data).toEqual(mockInventory);
    });

    it('returns static response for GET with path params', async () => {
      const mockPet: Pet = {
        id: 1,
        name: 'Fido',
        photoUrls: ['https://example.com/fido.jpg'],
        status: 'available',
      };
      server.use(createMock.getPetByIdMock({ result: mockPet, status: 200 }));

      const result = await getPetById({
        client,
        path: { petId: 1 },
      });

      expect(result.data).toEqual(mockPet);
    });

    it('returns static response for GET with query params', async () => {
      const mockPets: Pet[] = [
        { id: 1, name: 'Fido', photoUrls: [], status: 'available' },
        { id: 2, name: 'Rex', photoUrls: [], status: 'available' },
      ];
      server.use(createMock.findPetsByStatusMock({ result: mockPets, status: 200 }));

      const result = await findPetsByStatus({
        client,
        query: { status: 'available' },
      });

      expect(result.data).toEqual(mockPets);
    });

    it('returns static response for POST with body', async () => {
      const mockPet: Pet = {
        id: 10,
        name: 'NewPet',
        photoUrls: ['https://example.com/new.jpg'],
        status: 'pending',
      };
      server.use(createMock.addPetMock({ result: mockPet, status: 200 }));

      const result = await addPet({
        body: {
          name: 'NewPet',
          photoUrls: ['https://example.com/new.jpg'],
        },
        client,
      });

      expect(result.data).toEqual(mockPet);
    });
  });

  describe('static response without status (dominant response default)', () => {
    it('returns correct data when status is omitted', async () => {
      const mockPet: Pet = {
        id: 1,
        name: 'Fido',
        photoUrls: ['https://example.com/fido.jpg'],
        status: 'available',
      };
      server.use(createMock.getPetByIdMock({ result: mockPet }));

      const result = await getPetById({
        client,
        path: { petId: 1 },
      });

      expect(result.data).toEqual(mockPet);
    });

    it('returns correct data for POST when status is omitted', async () => {
      const mockPet: Pet = {
        id: 10,
        name: 'NewPet',
        photoUrls: ['https://example.com/new.jpg'],
        status: 'pending',
      };
      server.use(createMock.addPetMock({ result: mockPet }));

      const result = await addPet({
        body: {
          name: 'NewPet',
          photoUrls: ['https://example.com/new.jpg'],
        },
        client,
      });

      expect(result.data).toEqual(mockPet);
    });
  });

  describe('custom resolver function', () => {
    it('supports custom resolver for GET', async () => {
      server.use(
        createMock.getPetByIdMock(({ params }) =>
          HttpResponse.json({
            id: Number(params.petId),
            name: `Pet-${params.petId}`,
            photoUrls: [],
            status: 'available',
          }),
        ),
      );

      const result = await getPetById({
        client,
        path: { petId: 42 },
      });

      expect(result.data).toEqual({
        id: 42,
        name: 'Pet-42',
        photoUrls: [],
        status: 'available',
      });
    });

    it('supports custom resolver with request body', async () => {
      server.use(
        createMock.addPetMock(async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            id: 99,
            ...body,
          });
        }),
      );

      const result = await addPet({
        body: {
          name: 'EchoedPet',
          photoUrls: ['https://example.com/echo.jpg'],
        },
        client,
      });

      expect(result.data).toMatchObject({
        id: 99,
        name: 'EchoedPet',
      });
    });

    it('supports custom status codes', async () => {
      server.use(
        createMock.getPetByIdMock(() =>
          HttpResponse.json({ message: 'not found' }, { status: 404 }),
        ),
      );

      const result = await getPetById({
        client,
        path: { petId: 999 },
      });

      expect(result.response.status).toBe(404);
      expect(result.error).toEqual({ message: 'not found' });
    });
  });

  describe('toMswPath conversion', () => {
    it('handles numeric path param (e.g. /pet/{petId})', async () => {
      const mockPet: Pet = {
        id: 5,
        name: 'PathTest',
        photoUrls: [],
      };
      server.use(createMock.getPetByIdMock({ result: mockPet, status: 200 }));

      const result = await getPetById({
        client,
        path: { petId: 5 },
      });

      expect(result.response.ok).toBe(true);
      expect(result.data).toEqual(mockPet);
    });

    it('handles string path param (e.g. /user/{username})', async () => {
      const mockUser = {
        email: 'john@example.com',
        firstName: 'John',
        id: 1,
        lastName: 'Doe',
        username: 'john_doe',
      };
      server.use(createMock.getUserByNameMock({ result: mockUser, status: 200 }));

      const result = await getUserByName({
        client,
        path: { username: 'john_doe' },
      });

      expect(result.response.ok).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('handles path param mid-path (e.g. /pet/{petId}/uploadImage)', async () => {
      const mockResponse = { code: 200, message: 'uploaded', type: 'ok' };
      server.use(createMock.uploadFileMock({ result: mockResponse, status: 200 }));

      const result = await uploadFile({
        body: new Blob(['fake-image']),
        client,
        path: { petId: 7 },
      });

      expect(result.response.ok).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('resolver receives correct path param values', async () => {
      server.use(
        createMock.getOrderByIdMock(({ params }) => {
          // MSW normalizes path params to strings
          expect(typeof params.orderId).toBe('string');
          return HttpResponse.json({
            complete: false,
            id: Number(params.orderId),
            petId: 1,
            quantity: 1,
            status: 'placed',
          });
        }),
      );

      const result = await getOrderById({
        client,
        path: { orderId: 123 },
      });

      expect(result.data).toMatchObject({ id: 123 });
    });
  });

  describe('handler override', () => {
    it('later handlers override earlier ones', async () => {
      server.use(createMock.getInventoryMock({ result: { available: 1 }, status: 200 }));
      server.use(createMock.getInventoryMock({ result: { available: 999 }, status: 200 }));

      const result = await getInventory({ client });

      expect(result.data).toEqual({ available: 999 });
    });
  });

  describe('void operations', () => {
    it('handles operations with no response body', async () => {
      server.use(createMock.logoutUserMock());

      const result = await (await import('../src/client/sdk.gen')).logoutUser({ client });

      expect(result.response.ok).toBe(true);
    });
  });
});

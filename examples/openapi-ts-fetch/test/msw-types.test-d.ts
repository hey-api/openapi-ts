import { type HttpHandler, HttpResponse } from 'msw';
import { describe, expectTypeOf, it } from 'vitest';

import { createMswHandlers } from '../src/client/msw.gen';
import type { Order, Pet } from '../src/client/types.gen';

const handlers = createMswHandlers();

describe('MSW plugin type-level tests', () => {
  describe('static response values', () => {
    it('accepts correct response type (Pet) with status', () => {
      const pet: Pet = { name: 'Fido', photoUrls: [] };
      handlers.pick.getPetById({ body: pet, status: 200 });
      handlers.pick.addPet({ body: pet, status: 200 });
      handlers.pick.updatePet({ body: pet, status: 200 });
      handlers.pick.findPetsByStatus({ body: [pet], status: 200 });
    });

    it('accepts correct response type (Order) with status', () => {
      const order: Order = { id: 1, petId: 1, quantity: 1 };
      handlers.pick.placeOrder({ body: order, status: 200 });
      handlers.pick.getOrderById({ body: order, status: 200 });
    });

    it('accepts correct response type (string) with status', () => {
      handlers.pick.loginUser({ body: 'session-token', status: 200 });
    });

    it('accepts correct response type (record) with status', () => {
      handlers.pick.getInventory({ body: { available: 10, pending: 5 }, status: 200 });
    });

    it('rejects wrong response type for getPetById', () => {
      // @ts-expect-error - string is not a valid Pet response
      handlers.pick.getPetById({ body: 'wrong type', status: 200 });
    });

    it('rejects wrong response type for addPet', () => {
      // @ts-expect-error - number is not a valid Pet response
      handlers.pick.addPet({ body: 42, status: 200 });
    });

    it('rejects wrong response type for findPetsByStatus', () => {
      // @ts-expect-error - a single Pet is not Array<Pet>
      handlers.pick.findPetsByStatus({ body: { name: 'Fido', photoUrls: [] }, status: 200 });
    });

    it('rejects wrong response type for placeOrder', () => {
      // @ts-expect-error - Pet is not a valid Order response
      handlers.pick.placeOrder({ body: { name: 'Fido', photoUrls: [] }, status: 200 });
    });

    it('rejects wrong response type for loginUser', () => {
      // @ts-expect-error - number is not a valid string response
      handlers.pick.loginUser({ body: 123, status: 200 });
    });

    it('rejects wrong status code', () => {
      const pet: Pet = { name: 'Fido', photoUrls: [] };
      // @ts-expect-error - 999 is not a valid status code
      handlers.pick.getPetById({ body: pet, status: 999 });
    });

    it('accepts result without status (uses dominant response default)', () => {
      const pet: Pet = { name: 'Fido', photoUrls: [] };
      handlers.pick.getPetById({ body: pet });
      handlers.pick.addPet({ body: pet });
      handlers.pick.updatePet({ body: pet });
      handlers.pick.findPetsByStatus({ body: [pet] });
    });

    it('accepts result without status for Order operations', () => {
      const order: Order = { id: 1, petId: 1, quantity: 1 };
      handlers.pick.placeOrder({ body: order });
      handlers.pick.getOrderById({ body: order });
    });

    it('accepts result without status for string response', () => {
      handlers.pick.loginUser({ body: 'session-token' });
    });

    it('accepts result without status for record response', () => {
      handlers.pick.getInventory({ body: { available: 10, pending: 5 } });
    });

    it('rejects wrong response type even without status', () => {
      // @ts-expect-error - string is not a valid Pet response
      handlers.pick.getPetById({ body: 'wrong type' });
    });
  });

  describe('void operations accept no arguments', () => {
    it('logoutUser accepts no arguments', () => {
      handlers.pick.logoutUser();
    });

    it('deletePet accepts no arguments', () => {
      handlers.pick.deletePet();
    });

    it('deleteOrder accepts no arguments', () => {
      handlers.pick.deleteOrder();
    });

    it('deleteUser accepts no arguments', () => {
      handlers.pick.deleteUser();
    });
  });

  describe('resolver function typing', () => {
    it('accepts HttpResponseResolver', () => {
      handlers.pick.getInventory(() => HttpResponse.json({ available: 1 }));
    });

    it('accepts async HttpResponseResolver', () => {
      handlers.pick.getInventory(async () => HttpResponse.json({ available: 1 }));
    });

    it('resolver for path-param operation receives typed params', () => {
      handlers.pick.getPetById(({ params }) => {
        // params.petId should be string (StringifyPathParams)
        expectTypeOf(params.petId).toEqualTypeOf<string>();
        return HttpResponse.json({ name: 'Test', photoUrls: [] });
      });
    });

    it('resolver for body operation receives typed body via request', () => {
      handlers.pick.addPet(async ({ request }) => {
        const body = await request.json();
        // body should be typed as Pet (AddPetData['body'])
        expectTypeOf(body).toEqualTypeOf<Pet>();
        return HttpResponse.json({ name: body.name, photoUrls: body.photoUrls });
      });
    });

    it('resolver for void operation is typed correctly', () => {
      handlers.pick.logoutUser(() => HttpResponse.json(null));
    });

    it('resolver for void operation with path params', () => {
      handlers.pick.deletePet(({ params }) => {
        expectTypeOf(params.petId).toEqualTypeOf<string>();
        return new HttpResponse(null);
      });
    });
  });

  describe('return type', () => {
    it('all handler creators return HttpHandler', () => {
      const handler = handlers.pick.getPetById({
        body: { name: 'Test', photoUrls: [] },
        status: 200,
      });
      expectTypeOf(handler).toExtend<HttpHandler>();
    });
  });

  describe('factory configuration', () => {
    it('accepts optional config', () => {
      createMswHandlers();
      createMswHandlers({});
      createMswHandlers({ baseUrl: 'http://localhost:3000' });
    });
  });
});

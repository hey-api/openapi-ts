import { type HttpHandler, HttpResponse } from 'msw';
import { describe, expectTypeOf, it } from 'vitest';

import { createMswHandlerFactory } from '../src/client/msw.gen';
import type { Order, Pet } from '../src/client/types.gen';

const createMock = createMswHandlerFactory();

describe('MSW plugin type-level tests', () => {
  describe('static response values', () => {
    it('accepts correct response type (Pet) with status', () => {
      const pet: Pet = { name: 'Fido', photoUrls: [] };
      createMock.getPetByIdMock({ result: pet, status: 200 });
      createMock.addPetMock({ result: pet, status: 200 });
      createMock.updatePetMock({ result: pet, status: 200 });
      createMock.findPetsByStatusMock({ result: [pet], status: 200 });
    });

    it('accepts correct response type (Order) with status', () => {
      const order: Order = { id: 1, petId: 1, quantity: 1 };
      createMock.placeOrderMock({ result: order, status: 200 });
      createMock.getOrderByIdMock({ result: order, status: 200 });
    });

    it('accepts correct response type (string) with status', () => {
      createMock.loginUserMock({ result: 'session-token', status: 200 });
    });

    it('accepts correct response type (record) with status', () => {
      createMock.getInventoryMock({ result: { available: 10, pending: 5 }, status: 200 });
    });

    it('rejects wrong response type for getPetById', () => {
      // @ts-expect-error - string is not a valid Pet response
      createMock.getPetByIdMock({ result: 'wrong type', status: 200 });
    });

    it('rejects wrong response type for addPet', () => {
      // @ts-expect-error - number is not a valid Pet response
      createMock.addPetMock({ result: 42, status: 200 });
    });

    it('rejects wrong response type for findPetsByStatus', () => {
      // @ts-expect-error - a single Pet is not Array<Pet>
      createMock.findPetsByStatusMock({ result: { name: 'Fido', photoUrls: [] }, status: 200 });
    });

    it('rejects wrong response type for placeOrder', () => {
      // @ts-expect-error - Pet is not a valid Order response
      createMock.placeOrderMock({ result: { name: 'Fido', photoUrls: [] }, status: 200 });
    });

    it('rejects wrong response type for loginUser', () => {
      // @ts-expect-error - number is not a valid string response
      createMock.loginUserMock({ result: 123, status: 200 });
    });

    it('rejects wrong status code', () => {
      const pet: Pet = { name: 'Fido', photoUrls: [] };
      // @ts-expect-error - 999 is not a valid status code
      createMock.getPetByIdMock({ result: pet, status: 999 });
    });

    it('accepts result without status (uses dominant response default)', () => {
      const pet: Pet = { name: 'Fido', photoUrls: [] };
      createMock.getPetByIdMock({ result: pet });
      createMock.addPetMock({ result: pet });
      createMock.updatePetMock({ result: pet });
      createMock.findPetsByStatusMock({ result: [pet] });
    });

    it('accepts result without status for Order operations', () => {
      const order: Order = { id: 1, petId: 1, quantity: 1 };
      createMock.placeOrderMock({ result: order });
      createMock.getOrderByIdMock({ result: order });
    });

    it('accepts result without status for string response', () => {
      createMock.loginUserMock({ result: 'session-token' });
    });

    it('accepts result without status for record response', () => {
      createMock.getInventoryMock({ result: { available: 10, pending: 5 } });
    });

    it('rejects wrong response type even without status', () => {
      // @ts-expect-error - string is not a valid Pet response
      createMock.getPetByIdMock({ result: 'wrong type' });
    });
  });

  describe('void operations accept no arguments', () => {
    it('logoutUser accepts no arguments', () => {
      createMock.logoutUserMock();
    });

    it('deletePet accepts no arguments', () => {
      createMock.deletePetMock();
    });

    it('deleteOrder accepts no arguments', () => {
      createMock.deleteOrderMock();
    });

    it('deleteUser accepts no arguments', () => {
      createMock.deleteUserMock();
    });
  });

  describe('resolver function typing', () => {
    it('accepts HttpResponseResolver', () => {
      createMock.getInventoryMock(() => HttpResponse.json({ available: 1 }));
    });

    it('accepts async HttpResponseResolver', () => {
      createMock.getInventoryMock(async () => HttpResponse.json({ available: 1 }));
    });

    it('resolver for path-param operation receives typed params', () => {
      createMock.getPetByIdMock(({ params }) => {
        // params.petId should be string (StringifyPathParams)
        expectTypeOf(params.petId).toEqualTypeOf<string>();
        return HttpResponse.json({ name: 'Test', photoUrls: [] });
      });
    });

    it('resolver for body operation receives typed body via request', () => {
      createMock.addPetMock(async ({ request }) => {
        const body = await request.json();
        // body should be typed as Pet (AddPetData['body'])
        expectTypeOf(body).toEqualTypeOf<Pet>();
        return HttpResponse.json({ name: body.name, photoUrls: body.photoUrls });
      });
    });

    it('resolver for void operation is typed correctly', () => {
      createMock.logoutUserMock(() => HttpResponse.json(null));
    });

    it('resolver for void operation with path params', () => {
      createMock.deletePetMock(({ params }) => {
        expectTypeOf(params.petId).toEqualTypeOf<string>();
        return new HttpResponse(null);
      });
    });
  });

  describe('return type', () => {
    it('all handler creators return HttpHandler', () => {
      const handler = createMock.getPetByIdMock({
        result: { name: 'Test', photoUrls: [] },
        status: 200,
      });
      expectTypeOf(handler).toExtend<HttpHandler>();
    });
  });

  describe('factory configuration', () => {
    it('accepts optional config', () => {
      createMswHandlerFactory();
      createMswHandlerFactory({});
      createMswHandlerFactory({ baseUrl: 'http://localhost:3000' });
    });
  });
});

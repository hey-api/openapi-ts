import { handle, json } from './mock-http';

// Some basic mock data.
export type Pet = {
  age: number;
  id: number;
  name: string;
  species?: 'dog' | 'cat' | 'bird' | 'fish';
};

/**
 * Base mock data for pets. This does not get updated directly by handlers.
 */
export const petsData: Pet[] = [
  { age: 5, id: 1, name: 'Fluffy', species: 'dog' },
  { age: 2, id: 2, name: 'Fido', species: 'dog' },
  { age: 1, id: 3, name: 'Whiskers', species: 'cat' },
  { age: 2, id: 4, name: 'Polly', species: 'bird' },
] as const;

/**
 * Create a set of mock http handlers for listing, getting, creating, updating,
 * and deleting pets.
 *
 * Registered handlers:
 * - GET /pets
 * - GET /pets/:id
 * - PUT /pets/:id
 * - DELETE /pets/:id
 * - POST /pets
 */
export const mockPetHandlers = (baseURL: string) => {
  baseURL = baseURL.replace(/\/$/, '');
  const pets = [...petsData];

  return [
    handle<null, Pet[]>('get', `${baseURL}/pets`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      return json(
        pets.filter((pet) => {
          if (params.get('species')) {
            return pet.species === params.get('species');
          }
          return true;
        }),
      );
    }),
    handle<null, Pet>('get', `${baseURL}/pets/:id`, ({ params }) => {
      const pet = pets.find((p) => p.id === Number(params.id));
      if (!pet) return json(null, { status: 404 });
      return json(pet);
    }),
    handle<Partial<Pet>, Pet>(
      'put',
      `${baseURL}/pets/:id`,
      async ({ params, request }) => {
        const pet = pets.find((p) => p.id === Number(params.id));
        if (!pet) return json(null, { status: 404 });
        const { age, name, species } = await request.json();
        if (name) pet.name = name;
        if (species) pet.species = species;
        if (age) pet.age = age;
        return json(pet);
      },
    ),
    handle<null, any>('delete', `${baseURL}/pets/:id`, ({ params }) => {
      pets.splice(
        pets.findIndex((p) => p.id === Number(params.id)),
        1,
      );
      return new Response(null, { status: 204 });
    }),
    handle<Omit<Pet, 'id'>, Pet>(
      'post',
      `${baseURL}/pets`,
      async ({ request }) => {
        const newPet = { ...(await request.json()), id: pets.length + 1 };
        pets.push(newPet);
        return json(newPet);
      },
    ),
  ];
};

export type VerboseResponse = {
  body?: any;
  formData: Record<string, any>;
  headers: Record<string, string>;
  method: string;
  query: Record<string, string>;
  url: string;
};

export const mockVerboseHandler = (baseURL: string) =>
  handle<null, VerboseResponse>(
    'all',
    `${baseURL}/verbose`,
    async ({ request }) => {
      const resp: VerboseResponse = {
        formData: {},
        headers: Object.fromEntries(request.headers.entries()),
        method: request.method,
        query: Object.fromEntries(new URL(request.url).searchParams.entries()),
        url: request.url,
      };

      switch (request.headers.get('Content-Type')) {
        case 'application/json':
          resp.body = await request.json();
          break;
        case 'text/plain':
          resp.body = await request.text();
          break;
        case 'application/x-www-form-urlencoded':
          resp.formData = Object.fromEntries(
            (await request.formData()).entries(),
          );
          break;
      }

      return json(resp);
    },
  );

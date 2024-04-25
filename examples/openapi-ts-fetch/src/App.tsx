import './App.css';

import { client, createClient, OpenAPI } from '@hey-api/client-fetch';
import { useState } from 'react';

import { $Pet } from './client/schemas.gen';
import { PetService } from './client/services.gen';

createClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
});

OpenAPI.BASE = client.getConfig().baseUrl;

// OpenAPI.interceptors.response.use((response) => {
//   if (response.status === 200) {
//     console.log(`request to ${response.url} was successful`);
//   }
//   return response;
// });

function App() {
  const [pet, setPet] =
    useState<Awaited<ReturnType<typeof PetService.getPetById>>>();

  const onFetchPet = async () => {
    // random id 1-10
    const petId = Math.floor(Math.random() * (10 - 1 + 1) + 1);
    try {
      const fetchPet = await client.get({
        path: {
          petId,
        },
        url: 'pet/{petId}',
      });
      const pet = await PetService.getPetById({ petId });
      console.log(fetchPet, pet);
      setPet(pet);
    } catch (error) {
      // ..
    }
  };

  return (
    <>
      <div className="container">
        <a href="https://heyapi.vercel.app/" target="_blank">
          <img
            src="https://heyapi.vercel.app/logo.png"
            className="logo vanilla"
            alt="Hey API logo"
          />
        </a>
        <h1 className="h1">@hey-api/openapi-ts 🤝 Fetch API</h1>
      </div>
      <div className="flex">
        <button className="button" onClick={onFetchPet}>
          Fetch random pet
        </button>
        <span className="pet-name">Fetched pet's name: {pet?.name}</span>
      </div>
      <div className="openapi-ts">
        <code>{"import { $Pet } from './client/schemas.gen'"}</code>
        <pre>{JSON.stringify($Pet, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;

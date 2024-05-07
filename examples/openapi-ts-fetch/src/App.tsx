import './App.css';

import { createClient } from '@hey-api/client-fetch';
import { useState } from 'react';

import { $Pet } from './client/schemas.gen';
import {
  findPetsByStatus,
  getInventory,
  getPetById,
} from './client/services.gen';

createClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
});

function App() {
  const [pet, setPet] =
    useState<Awaited<ReturnType<typeof getPetById>>['data']>();

  const onFetchPet = async () => {
    // random id 1-10
    const petId = Math.floor(Math.random() * (10 - 1 + 1) + 1);
    const { data: pet, error } = await getPetById({
      path: {
        petId,
      },
    });
    if (error) {
      // TODO: discriminate by error status
    }
    setPet(pet);
  };

  const onFindPetsByStatus = () => {
    // everything in this call is optional
    findPetsByStatus({
      query: {
        status: 'pending',
      },
    });
  };

  const onGetInventory = () => {
    // this call has no params but could be still customized
    getInventory();
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
      <div className="flex">
        <button className="button" onClick={onFindPetsByStatus}>
          Find pets by status
        </button>
        <button className="button" onClick={onGetInventory}>
          Get inventory
        </button>
      </div>
      <div className="openapi-ts">
        <code>{"import { $Pet } from './client/schemas.gen'"}</code>
        <pre>{JSON.stringify($Pet, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;

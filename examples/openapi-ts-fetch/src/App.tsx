import './App.css';

import { client, createClient, OpenAPI } from '@hey-api/client-fetch';
import { useState } from 'react';

import { $Pet } from './client/schemas.gen';
import { PetService } from './client/services.gen';

client.interceptors.request.use((request, options) => {
  console.log('global request interceptor', request, options);
  return request;
});

client.interceptors.response.use((response, request, options) => {
  console.log('global response interceptor', response, request, options);
  return response;
});

const globalClient = createClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
});

globalClient.interceptors.request.use((request, options) => {
  console.log('global request interceptor 2', request, options);
  return request;
});

globalClient.interceptors.response.use((response, request, options) => {
  console.log('global response interceptor 2', response, request, options);
  return response;
});

const localClient = createClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  global: false,
});

localClient.interceptors.request.use((request, options) => {
  console.log('local request interceptor', request, options);
  return request;
});

localClient.interceptors.response.use((response, request, options) => {
  console.log('local response interceptor', response, request, options);
  return response;
});

OpenAPI.BASE = client.getConfig().baseUrl;

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

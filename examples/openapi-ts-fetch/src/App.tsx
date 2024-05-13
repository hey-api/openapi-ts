import './App.css';

import { createClient } from '@hey-api/client-fetch';

// import { useState } from 'react';
import { $Email } from './client/schemas.gen';
import {
  buyMuseumTickets,
  getMuseumHours,
  getSpecialEvent,
} from './client/services.gen';

createClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
});

function App() {
  // const [pet, setPet] = useState<Awaited<ReturnType<typeof getPetById>>['data']>();

  const onGetSpecialEvent = async () => {
    const { data, error } = await getSpecialEvent({
      path: {
        eventId: 'dad4bce8-f5cb-4078-a211-995864315e39',
      },
    });
    if (error) {
      console.log(error.title);
    }
    console.log(data);
    // setPet(data);
  };

  const onBuyMuseumTickets = () => {
    // @ts-ignore
    buyMuseumTickets({
      body: '',
    });
  };

  const onGetMuseumHours = () => {
    // this call has no params but could be still customized
    getMuseumHours({
      // query: {}
    });
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
        <button className="button" onClick={onGetSpecialEvent}>
          Get Special Event
        </button>
        {/* <span className="pet-name">Fetched pet's name: {pet?.name}</span> */}
      </div>
      <div className="flex">
        <button className="button" onClick={onBuyMuseumTickets}>
          Buy Museum Tickets
        </button>
        <button className="button" onClick={onGetMuseumHours}>
          Get Museum Hours
        </button>
      </div>
      <div className="openapi-ts">
        <code>{"import { $Email } from './client/schemas.gen'"}</code>
        <pre>{JSON.stringify($Email, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;

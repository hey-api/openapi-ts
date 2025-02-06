import type { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import {
  provideAngularQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { client } from '../client/client.gen';
import { routes } from './app.routes';

client.setConfig({
  // set default base url for requests made by this client
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  /**
   * Set default headers only for requests made by this client. This is to
   * demonstrate local clients and their configuration taking precedence over
   * internal service client.
   */
  headers: {
    Authorization: 'Bearer <token_from_local_client>',
  },
});

client.interceptors.request.use((request, options) => {
  // Middleware is great for adding authorization tokens to requests made to
  // protected paths. Headers are set randomly here to allow surfacing the
  // default headers, too.
  if (
    options.url === '/pet/{petId}' &&
    options.method === 'GET' &&
    Math.random() < 0.5
  ) {
    request.headers.set('Authorization', 'Bearer <token_from_interceptor>');
  }
  return request;
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAngularQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
          },
        },
      }),
    ),
    provideAnimationsAsync(),
  ],
};

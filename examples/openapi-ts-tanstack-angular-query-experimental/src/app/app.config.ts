import { provideHttpClient, withFetch } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { client } from '../client/client.gen';
import { provideHeyApiClient } from '../client/client/client.gen';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideHeyApiClient(client),
    provideTanStackQuery(
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

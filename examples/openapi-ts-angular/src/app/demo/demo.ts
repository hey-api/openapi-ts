import { JsonPipe } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import type { AddPetErrors, Pet } from '../../client';
import { PetService } from '../../client';
import { createClient } from '../../client/client';

const localClient = createClient({
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

@Component({
  host: { ngSkipHydration: 'true' },
  imports: [RouterOutlet, JsonPipe],
  selector: 'app-demo',
  styleUrl: './demo.css',
  templateUrl: './demo.html',
})
export class Demo {
  pet = signal<Pet | undefined>(undefined);
  error = signal<
    | undefined
    | {
        error: AddPetErrors[keyof AddPetErrors] | Error;
        response: HttpErrorResponse;
      }
  >(undefined);

  #petService = inject(PetService);
  #http = inject(HttpClient);

  // // you can set a global httpClient for this client like so, in your app.config, or on each request (like below)
  // ngOnInit(): void {
  //   localClient.setConfig({
  //     httpClient: this.#http,
  //   });
  // }

  onGetPetByIdLocalClient = async () => {
    const { data, error, response } = await this.#petService.getPetById({
      client: localClient,
      httpClient: this.#http,
      path: {
        // random id 1-10
        petId: Math.floor(Math.random() * (10 - 1 + 1) + 1),
      },
    });

    if (error) {
      console.log(error);
      this.error.set({
        error,
        response: response as HttpErrorResponse,
      });
      return;
    }

    this.pet.set(data);
    this.error.set(undefined);
  };

  onGetPetById = async () => {
    const { data, error, response } = await this.#petService.getPetById({
      path: {
        // random id 1-10
        petId: Math.floor(Math.random() * (10 - 1 + 1) + 1),
      },
    });

    if (error) {
      console.log(error);
      this.error.set({
        error,
        response: response as HttpErrorResponse,
      });
      return;
    } else {
      console.log(error);
      console.log(response);
      this.pet.set(data);
      this.error.set(undefined);
    }
  };
}

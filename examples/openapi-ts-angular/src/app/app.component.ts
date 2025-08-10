import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { getPetById } from '../client';
import { createClient } from '../client/client';

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
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'angular';

  private http = inject(HttpClient);

  async onGetPetById() {
    this.http.get('', {});
    const { data, error } = await getPetById({
      client: localClient,
      path: {
        // random id 1-10
        petId: Math.floor(Math.random() * (10 - 1 + 1) + 1),
      },
    });
    if (error) {
      console.log(error);
      return;
    }
    console.log(data);
    // setPet(data!);
  }
}

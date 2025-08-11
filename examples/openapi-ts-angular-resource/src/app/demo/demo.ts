import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PetResources } from '../../client/@hey-api/angular-resource.gen';

@Component({
  host: { ngSkipHydration: 'true' },
  imports: [RouterOutlet, JsonPipe],
  selector: 'app-demo',
  styleUrl: './demo.css',
  templateUrl: './demo.html',
})
export class Demo {
  #petResources = inject(PetResources);

  petId = signal(0);

  // if you don't use `asClass`, you can simply remove the inject and use `getPetByIdResource(...)` here
  pet = this.#petResources.getPetById(() => ({
    path: {
      petId: this.petId(),
    },
  }));

  onGetPetById = async () => {
    this.petId.set(Math.floor(Math.random() * (10 - 1 + 1) + 1));
  };
}

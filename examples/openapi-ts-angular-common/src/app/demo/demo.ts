import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { PetServiceResources } from '../../client';

@Component({
  host: { ngSkipHydration: 'true' },
  imports: [JsonPipe],
  selector: 'app-demo',
  styleUrl: './demo.css',
  templateUrl: './demo.html',
})
export class Demo {
  #petResources = inject(PetServiceResources);

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

import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import type { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';

import type { Pet } from '../../client';
import {
  addPetMutation,
  getPetByIdOptions,
  updatePetMutation,
} from '../../client/@tanstack/angular-query-experimental.gen';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  selector: 'app-pet-store',
  standalone: true,
  styleUrls: ['./pet-store.component.css'],
  templateUrl: './pet-store.component.html',
})
export class PetStoreComponent {
  #snackbar = inject(MatSnackBar);

  petId = signal<Pet['id']>(null!);
  pet = injectQuery(() => ({
    enabled: this.petId() !== null,
    ...getPetByIdOptions({
      path: { petId: this.petId()! },
    }),
  }));

  addPet = injectMutation(() => addPetMutation());
  updatePet = injectMutation(() => updatePetMutation());

  constructor() {
    effect(() => {
      if (this.pet.isError()) {
        this.#snackbar.open(`Pet "${this.petId()}" not found.`);
      }
    });
  }

  //  updatePet = useMutation({
  //   ...updatePetMutation(),
  //   onError: (error) => {
  //     console.log(error);
  //   },
  //   onSuccess: (data) => {
  //     setPet(data);
  //   },
  // });

  //  { data, error } = useQuery({
  //   ...getPetByIdOptions({
  //     client: localClient,
  //     path: {
  //       petId: petId!,
  //     },
  //   }),
  //   enabled: Boolean(petId),
  // });

  getRandomPet() {
    // random id 1-10
    this.petId.set(Math.floor(Math.random() * (10 - 1 + 1) + 1));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleUpdatePet(name: string, category: string) {
    throw new Error('Method not implemented.');
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const { name, category } = form.value as {
      category: string;
      name: string;
    };

    this.addPet.mutate({
      body: {
        category: {
          id: 0,
          name: category,
        },
        id: 0,
        name,
        photoUrls: ['string'],
        status: 'available',
        tags: [
          {
            id: 0,
            name: 'string',
          },
        ],
      },
    });
  }
}

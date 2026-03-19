import { JsonPipe } from '@angular/common';
import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';

import type { Pet } from '../../client';
import {
  addPetMutation,
  getPetByIdOptions,
  updatePetMutation,
} from '../../client/@tanstack/angular-query-experimental.gen';

@Component({
  imports: [
    JsonPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinner,
  ],
  selector: 'app-pet-store',
  standalone: true,
  styleUrls: ['./pet-store.component.css'],
  templateUrl: './pet-store.component.html',
})
export class PetStoreComponent {
  #snackbar = inject(MatSnackBar);
  form = viewChild.required(NgForm);

  petId = signal<Pet['id']>(undefined);

  petState = injectQuery(() => ({
    enabled: (this.petId() ?? 0) > 0,
    ...getPetByIdOptions({
      path: { petId: this.petId()! },
    }),
  }));

  addPet = injectMutation(() => ({
    ...addPetMutation(),
    onError: (err) => {
      this.#snackbar.open(err.message);
    },
    onSuccess: () => {
      this.#snackbar.open('Pet added successfully!');
    },
  }));
  updatePet = injectMutation(() => ({
    ...updatePetMutation(),
    onError: (err) => {
      this.#snackbar.open(err.message);
    },
    onSuccess: () => {
      this.#snackbar.open('Pet updated successfully!');
    },
  }));

  nextPetState: Partial<Pet> = {};

  constructor() {
    effect(() => {
      const err = this.petState.error();

      if (err) {
        this.#snackbar.open(String(err));
      }
    });

    effect(() => {
      this.nextPetState = { ...this.petState.data() };
    });
  }

  getRandomPet() {
    // random id 1-10
    this.petId.set(Math.floor(Math.random() * (10 - 1 + 1) + 1));
  }

  handleUpdatePet = async (event: Event) => {
    event.preventDefault();

    await this.updatePet.mutateAsync({
      body: this.nextPetState as Pet,
    });
  };

  onSubmit = async (form: NgForm) => {
    if (!form.valid) {
      return;
    }

    await this.addPet.mutateAsync({
      body: this.nextPetState as Pet,
    });
  };
}

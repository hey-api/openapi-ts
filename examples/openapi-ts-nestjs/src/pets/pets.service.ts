import { Injectable, NotFoundException } from '@nestjs/common';

import type {
  CreatePetData,
  ListPetsData,
  Pet,
  ShowPetByIdData,
  UpdatePetData,
} from '../client/types.gen';

@Injectable()
export class PetsService {
  private readonly pets: Pet[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Fido',
      status: 'available',
      tag: 'dog',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Kitty',
      status: 'available',
      tag: 'cat',
    },
  ];

  async listPets(query?: ListPetsData['query']): Promise<Pet[]> {
    const offset = query?.offset ?? 0;
    const limit = query?.limit ?? 20;
    return this.pets.slice(offset, offset + limit);
  }

  async createPet(body: CreatePetData['body']): Promise<Pet> {
    const pet: Pet = {
      id: crypto.randomUUID(),
      name: body.name,
      status: 'available',
      tag: body.tag,
    };
    this.pets.push(pet);
    return pet;
  }

  async showPetById(path: ShowPetByIdData['path']): Promise<Pet> {
    const pet = this.pets.find((p) => p.id === path.petId);
    if (!pet) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }
    return pet;
  }

  async updatePet(path: UpdatePetData['path'], body: UpdatePetData['body']): Promise<Pet> {
    const pet = this.pets.find((p) => p.id === path.petId);
    if (!pet) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }
    if (body.name !== undefined) {
      pet.name = body.name;
    }
    if (body.tag !== undefined) {
      pet.tag = body.tag;
    }
    if (body.status !== undefined) {
      pet.status = body.status;
    }
    return pet;
  }

  async deletePet(path: ShowPetByIdData['path']): Promise<void> {
    const index = this.pets.findIndex((p) => p.id === path.petId);
    if (index === -1) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }
    this.pets.splice(index, 1);
  }
}

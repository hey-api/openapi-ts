import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';

import type { PetsControllerMethods } from '../client/nestjs.gen';
import type { CreatePetData, ListPetsData, Pet, ShowPetByIdData } from '../client/types.gen';

@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'createPet' | 'listPets' | 'showPetById'
> {
  private readonly pets: Pet[] = [
    { id: '1', name: 'Fido', status: 'available', tag: 'dog' },
    { id: '2', name: 'Kitty', status: 'available', tag: 'cat' },
  ];

  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {
    const limit = query?.limit ?? 20;

    return this.pets.slice(0, limit);
  }

  @Post()
  async createPet(@Body() body: CreatePetData['body']) {
    const pet: Pet = {
      id: crypto.randomUUID(),
      name: body.name,
      status: 'available',
      tag: body.tag,
    };

    this.pets.push(pet);

    return pet;
  }

  @Get(':petId')
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    const pet = this.pets.find((p) => p.id === path.petId);

    if (!pet) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }

    return pet;
  }
}

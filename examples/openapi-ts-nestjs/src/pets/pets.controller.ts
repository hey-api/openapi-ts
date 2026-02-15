import { Controller, Get, Param, Post, Query } from '@nestjs/common';

import type { ControllerMethods } from '../client/nestjs.gen';
import type { ListPetsData, ShowPetByIdData } from '../client/types.gen';

@Controller('pets')
export class PetsController implements Pick<
  ControllerMethods,
  'listPets' | 'createPets' | 'showPetById'
> {
  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {
    const pets = [
      { id: '1', name: 'Fido' },
      { id: '2', name: 'Kitty' },
    ];
    return query?.limit ? pets.slice(0, query.limit) : pets;
  }

  @Post()
  async createPets() {
    return;
  }

  @Get(':petId')
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    return {
      id: Number(path.petId),
      name: 'Kitty',
    };
  }
}

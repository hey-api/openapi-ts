import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import type { PetsControllerMethods } from '../client/nestjs.gen';
import type {
  CreatePetData,
  DeletePetData,
  ListPetsData,
  Pet,
  ShowPetByIdData,
  UpdatePetData,
} from '../client/types.gen';

@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'createPet' | 'deletePet' | 'listPets' | 'showPetById' | 'updatePet'
> {
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

  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {
    const offset = query?.offset ?? 0;
    const limit = query?.limit ?? 20;
    return this.pets.slice(offset, offset + limit);
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

  @Put(':petId')
  async updatePet(@Param() path: UpdatePetData['path'], @Body() body: UpdatePetData['body']) {
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

  @Delete(':petId')
  @HttpCode(204)
  async deletePet(@Param() path: DeletePetData['path']) {
    const index = this.pets.findIndex((p) => p.id === path.petId);
    if (index === -1) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }
    this.pets.splice(index, 1);
  }
}

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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { PetsControllerMethods } from '../client/nestjs.gen';
import type {
  DeletePetData,
  ListPetsData,
  Pet,
  ShowPetByIdData,
  UpdatePetData,
} from '../client/types.gen';
import type { CreatePetDto } from './dto/create-pet.dto';
import type { UpdatePetDto } from './dto/update-pet.dto';

@ApiTags('pets')
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
  @ApiOperation({ summary: 'List all pets' })
  @ApiResponse({ description: 'A list of pets', status: 200 })
  async listPets(@Query() query?: ListPetsData['query']) {
    const offset = query?.offset ?? 0;
    const limit = query?.limit ?? 20;
    return this.pets.slice(offset, offset + limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pet' })
  @ApiResponse({ description: 'Pet created', status: 201 })
  @ApiResponse({ description: 'Validation error', status: 400 })
  async createPet(@Body() body: CreatePetDto) {
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
  @ApiOperation({ summary: 'Find pet by ID' })
  @ApiResponse({ description: 'Pet found', status: 200 })
  @ApiResponse({ description: 'Pet not found', status: 404 })
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    const pet = this.pets.find((p) => p.id === path.petId);
    if (!pet) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }
    return pet;
  }

  @Put(':petId')
  @ApiOperation({ summary: 'Update a pet' })
  @ApiResponse({ description: 'Pet updated', status: 200 })
  @ApiResponse({ description: 'Validation error', status: 400 })
  @ApiResponse({ description: 'Pet not found', status: 404 })
  async updatePet(@Param() path: UpdatePetData['path'], @Body() body: UpdatePetDto) {
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
  @ApiOperation({ summary: 'Delete a pet' })
  @ApiResponse({ description: 'Pet deleted', status: 204 })
  @ApiResponse({ description: 'Pet not found', status: 404 })
  async deletePet(@Param() path: DeletePetData['path']) {
    const index = this.pets.findIndex((p) => p.id === path.petId);
    if (index === -1) {
      throw new NotFoundException(`Pet ${path.petId} not found`);
    }
    this.pets.splice(index, 1);
  }
}

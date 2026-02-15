import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { PetsControllerMethods } from '../client/nestjs.gen';
import type {
  CreatePetData,
  ListPetsData,
  ShowPetByIdData,
  UpdatePetData,
} from '../client/types.gen';
import type { CreatePetDto } from './dto/create-pet.dto';
import type { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@ApiTags('pets')
@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'listPets' | 'createPet' | 'showPetById' | 'updatePet' | 'deletePet'
> {
  constructor(@Inject(PetsService) private readonly petsService: PetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all pets' })
  @ApiResponse({ description: 'A list of pets', status: 200 })
  async listPets(@Query() query?: ListPetsData['query']) {
    return this.petsService.listPets(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pet' })
  @ApiResponse({ description: 'Pet created', status: 201 })
  @ApiResponse({ description: 'Validation error', status: 400 })
  async createPet(@Body() body: CreatePetDto) {
    return this.petsService.createPet(body as CreatePetData['body']);
  }

  @Get(':petId')
  @ApiOperation({ summary: 'Find pet by ID' })
  @ApiResponse({ description: 'Pet found', status: 200 })
  @ApiResponse({ description: 'Pet not found', status: 404 })
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    return this.petsService.showPetById(path);
  }

  @Put(':petId')
  @ApiOperation({ summary: 'Update a pet' })
  @ApiResponse({ description: 'Pet updated', status: 200 })
  @ApiResponse({ description: 'Validation error', status: 400 })
  @ApiResponse({ description: 'Pet not found', status: 404 })
  async updatePet(@Param() path: UpdatePetData['path'], @Body() body: UpdatePetDto) {
    return this.petsService.updatePet(path, body as UpdatePetData['body']);
  }

  @Delete(':petId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a pet' })
  @ApiResponse({ description: 'Pet deleted', status: 204 })
  @ApiResponse({ description: 'Pet not found', status: 404 })
  async deletePet(@Param() path: ShowPetByIdData['path']) {
    return this.petsService.deletePet(path);
  }
}

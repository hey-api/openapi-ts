import { Module } from '@nestjs/common';

import { PetsController } from './pets/pets.controller';

@Module({
  controllers: [PetsController],
})
export class AppModule {}

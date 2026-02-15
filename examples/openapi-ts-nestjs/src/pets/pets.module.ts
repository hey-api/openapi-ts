import { Module } from '@nestjs/common';

import { PetsController } from './pets.controller';

@Module({
  controllers: [PetsController],
})
export class PetsModule {}

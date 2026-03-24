import { Module } from '@nestjs/common';

import { PetsModule } from './pets/pets.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [PetsModule, StoreModule],
})
export class AppModule {}

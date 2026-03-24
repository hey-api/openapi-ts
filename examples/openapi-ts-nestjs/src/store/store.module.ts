import { Module } from '@nestjs/common';

import { StoreController } from './store.controller';

@Module({
  controllers: [StoreController],
})
export class StoreModule {}

import { Controller, Get } from '@nestjs/common';

import type { StoreControllerMethods } from '../client/nestjs.gen';

@Controller('store')
export class StoreController implements Pick<StoreControllerMethods, 'getInventory'> {
  @Get('inventory')
  async getInventory() {
    return {
      available: 10,
      pending: 3,
      sold: 5,
    };
  }
}

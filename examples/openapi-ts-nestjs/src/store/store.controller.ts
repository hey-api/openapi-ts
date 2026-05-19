import { Controller, Get } from '@nestjs/common';

import type { StoreControllerMethods } from '../client/nestjs.gen';
import type { GetInventoryResponse } from '../client/types.gen';

@Controller('store')
export class StoreController implements Pick<StoreControllerMethods, 'getInventory'> {
  @Get('inventory')
  async getInventory(): Promise<GetInventoryResponse> {
    return {
      available: 10,
      pending: 3,
      sold: 5,
    };
  }
}

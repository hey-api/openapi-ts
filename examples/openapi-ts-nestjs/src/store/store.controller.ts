import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { StoreControllerMethods } from '../client/nestjs.gen';

@ApiTags('store')
@Controller('store')
export class StoreController implements Pick<StoreControllerMethods, 'getInventory'> {
  @Get('inventory')
  @ApiOperation({ summary: 'Returns pet inventories by status' })
  @ApiResponse({ description: 'Successful operation', status: 200 })
  async getInventory() {
    return {
      available: 10,
      pending: 3,
      sold: 5,
    };
  }
}

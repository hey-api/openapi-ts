import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { StoreControllerMethods } from '../client/nestjs.gen';
import { StoreService } from './store.service';

@ApiTags('store')
@Controller('store')
export class StoreController implements Pick<StoreControllerMethods, 'getInventory'> {
  constructor(@Inject(StoreService) private readonly storeService: StoreService) {}

  @Get('inventory')
  @ApiOperation({ summary: 'Returns pet inventories by status' })
  @ApiResponse({ description: 'Successful operation', status: 200 })
  async getInventory() {
    return this.storeService.getInventory();
  }
}

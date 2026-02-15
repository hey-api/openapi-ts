import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
  async getInventory(): Promise<Record<string, number>> {
    return {
      available: 10,
      pending: 3,
      sold: 5,
    };
  }
}

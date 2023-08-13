import { Controller } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { Get } from '@nestjs/common';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @Get('pending-order')
  async getPendingOrders() {
    try {
      return this.consumerService.getPendingOrders()
    } catch (err) {
      console.error(err)
    }
  }
}

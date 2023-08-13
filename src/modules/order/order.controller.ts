import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { Post, Body } from '@nestjs/common';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() body: { message: string}) {
    const { message } = body
    try {
      return await this.orderService.create(message);
    } catch (e) {
      console.error(e)
    }
  }
}

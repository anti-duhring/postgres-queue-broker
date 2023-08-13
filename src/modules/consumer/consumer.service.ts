import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { orderStatus } from '../../common/orderStatus.enum';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ConsumerService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingOrders() {
    const pendingOrders = await this.prisma.$queryRaw`
            	select o.*
                from "Order" o 
                where o.status = 'PENDING'
                order by o.created_at asc 
                for update skip locked
        `;

    return pendingOrders as any[];
  }

  @Cron('0 * * * * *')
  async processOrders() {

    let pending = true

    while(pending) {
      pending = await this.prisma.$transaction(async (tx) => {
        const pendingOrders: any[] = await tx.$queryRaw`
          select o.*
          from "Order" o 
          where o.status = 'PENDING'
          order by o.created_at asc 
          limit 50
          for update skip locked
        `;

        if(!pendingOrders.length) {
          return false
        }
  
        await Promise.all(
          pendingOrders.map(async order => {
            await tx.order.update({
              where: {
                id: order.id
              },
              data: {
                status: orderStatus.COMPLETED
              }
            })
  
            console.log(`Order ${order.id} has been processed`);
          })
        )

        return true
      })
    }
  }
}

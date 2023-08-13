import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { orderStatus } from '../../common/orderStatus.enum'
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
        `

        return pendingOrders
    }

    @Cron('0 * * * * *')
    async processOrders() {
        console.log('Hey')
    }
}

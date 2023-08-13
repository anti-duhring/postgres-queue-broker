import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { orderStatus } from '../../common/orderStatus.enum'

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService) {}

    async create(message: string) {
        const order = await this.prisma.order.create({
            data: {
                message,
                status: orderStatus.PENDING
            }
        })

        return order
    }
}

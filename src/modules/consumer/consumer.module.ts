import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ConsumerController],
  providers: [ConsumerService, PrismaService]
})
export class ConsumerModule {}

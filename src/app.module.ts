import { Module } from '@nestjs/common';
import { OrderModule } from './modules/order/order.module';
import { ConsumerModule } from './modules/consumer/consumer.module';
import { ScheduleModule } from '@nestjs/schedule' 

@Module({
  imports: [OrderModule, ConsumerModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { CompensationPlan, CompensationPlanSchema } from './schemas/compensation-plan.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CompensationPlan.name, schema: CompensationPlanSchema }]),
    NotificationsModule,
  ],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}

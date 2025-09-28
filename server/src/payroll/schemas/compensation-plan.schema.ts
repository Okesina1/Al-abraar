import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SalaryStatus = 'paid' | 'scheduled' | 'processing';
export type SalaryAdjustmentType = 'bonus' | 'deduction';

@Schema({ _id: false })
export class SalaryAdjustment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, enum: ['bonus', 'deduction'] })
  type: SalaryAdjustmentType;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  note?: string;

  @Prop({ required: true })
  createdAt: string; // ISO string
}
export const SalaryAdjustmentSchema = SchemaFactory.createForClass(SalaryAdjustment);

@Schema({ _id: false })
export class SalaryRecord {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  month: string; // YYYY-MM

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['paid', 'scheduled', 'processing'] })
  status: SalaryStatus;

  @Prop({ required: true })
  scheduledPayoutDate: string; // ISO

  @Prop()
  paidOn?: string; // ISO

  @Prop({ type: [SalaryAdjustmentSchema], default: [] })
  adjustments?: SalaryAdjustment[];
}
export const SalaryRecordSchema = SchemaFactory.createForClass(SalaryRecord);

@Schema({ timestamps: true })
export class CompensationPlan extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, unique: true, required: true })
  ustaadhId: Types.ObjectId;

  @Prop({ required: true })
  monthlySalary: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, min: 1, max: 28 })
  paymentDayOfMonth: number;

  @Prop({ required: true })
  effectiveFrom: string; // ISO date string

  @Prop()
  nextReviewDate?: string; // ISO

  @Prop({ type: [SalaryRecordSchema], default: [] })
  salaryHistory: SalaryRecord[];
}

export const CompensationPlanSchema = SchemaFactory.createForClass(CompensationPlan);

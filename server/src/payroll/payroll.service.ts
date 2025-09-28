import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompensationPlan, SalaryRecord } from './schemas/compensation-plan.schema';
import { AddAdjustmentDto, MarkPaidDto, UpsertCompensationPlanDto } from './dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(CompensationPlan.name) private planModel: Model<CompensationPlan>,
  ) {}

  async getPlanForUstaadh(ustaadhId: string): Promise<CompensationPlan | null> {
    return this.planModel.findOne({ ustaadhId: new Types.ObjectId(ustaadhId) }).exec();
  }

  async upsertPlan(dto: UpsertCompensationPlanDto): Promise<CompensationPlan> {
    const ustaadhObjectId = new Types.ObjectId(dto.ustaadhId);

    const update = {
      monthlySalary: dto.monthlySalary,
      currency: dto.currency,
      paymentDayOfMonth: dto.paymentDayOfMonth,
      effectiveFrom: dto.effectiveFrom,
      nextReviewDate: dto.nextReviewDate,
    };

    const plan = await this.planModel.findOneAndUpdate(
      { ustaadhId: ustaadhObjectId },
      { $set: update, $setOnInsert: { ustaadhId: ustaadhObjectId } },
      { upsert: true, new: true },
    );

    return plan;
  }

  private toScheduledDateISO(monthKey: string, paymentDay: number) {
    const [year, month] = monthKey.split('-').map((v) => parseInt(v, 10));
    const daysInTargetMonth = new Date(year, month, 0).getDate();
    const day = Math.min(paymentDay, daysInTargetMonth);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
  }

  async addAdjustment(ustaadhId: string, dto: AddAdjustmentDto): Promise<CompensationPlan> {
    const plan = await this.getPlanForUstaadh(ustaadhId);
    if (!plan) throw new NotFoundException('Compensation plan not found');

    const monthKey = dto.month;
    let record = plan.salaryHistory.find((r) => r.month === monthKey);
    if (!record) {
      record = {
        id: `${ustaadhId}-${monthKey}`,
        month: monthKey,
        amount: plan.monthlySalary,
        status: 'scheduled',
        scheduledPayoutDate: this.toScheduledDateISO(monthKey, plan.paymentDayOfMonth),
        adjustments: [],
      } as SalaryRecord;
      plan.salaryHistory.push(record);
    }

    record.adjustments = record.adjustments || [];
    record.adjustments.push({
      id: `${monthKey}-${Date.now()}`,
      type: dto.type,
      label: dto.label,
      amount: dto.amount,
      note: dto.note,
      createdAt: new Date().toISOString(),
    });

    await plan.save();
    return plan;
  }

  async markPaid(ustaadhId: string, dto: MarkPaidDto): Promise<CompensationPlan> {
    const plan = await this.getPlanForUstaadh(ustaadhId);
    if (!plan) throw new NotFoundException('Compensation plan not found');

    const monthKey = dto.month;
    const record = plan.salaryHistory.find((r) => r.month === monthKey);
    if (!record) throw new BadRequestException('Salary record not found for given month');

    record.status = 'paid';
    record.paidOn = dto.paidOn ?? new Date().toISOString();

    await plan.save();
    return plan;
  }

  async obligations(month?: string) {
    const plans = await this.planModel.find().exec();
    const result = plans.map((plan) => {
      const records = plan.salaryHistory.filter((r) => (month ? r.month === month : true));
      const getAdj = (r: SalaryRecord) => (r.adjustments || []).reduce((s, a) => (a.type === 'deduction' ? s - a.amount : s + a.amount), 0);
      const getNet = (r: SalaryRecord) => r.amount + getAdj(r);

      const scheduled = records.filter((r) => r.status !== 'paid').reduce((s, r) => s + getNet(r), 0);
      const paid = records.filter((r) => r.status === 'paid').reduce((s, r) => s + getNet(r), 0);

      return {
        ustaadhId: plan.ustaadhId,
        currency: plan.currency,
        scheduled,
        paid,
      };
    });

    const totals = result.reduce(
      (acc, r) => {
        acc.scheduled += r.scheduled;
        acc.paid += r.paid;
        return acc;
      },
      { scheduled: 0, paid: 0 },
    );

    return { totals, breakdown: result };
  }
}

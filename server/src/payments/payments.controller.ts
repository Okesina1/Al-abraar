import { Controller, Post, Body, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  async createPaymentIntent(@Body() body: { bookingId: string; amount: number }) {
    return this.paymentsService.createPaymentIntent(body.bookingId, body.amount);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refund')
  async refundPayment(@Body() body: { paymentIntentId: string; amount?: number }) {
    return this.paymentsService.refundPayment(body.paymentIntentId, body.amount);
  }
}
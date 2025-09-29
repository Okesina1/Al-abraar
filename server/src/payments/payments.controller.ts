import { Controller, Post, Body, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(
      createPaymentIntentDto.bookingId, 
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency
    );
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
  async refundPayment(@Body() refundPaymentDto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(
      refundPaymentDto.paymentIntentId, 
      refundPaymentDto.amount
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('paypal/create-order')
  async createPayPalOrder(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPayPalOrder(
      createPaymentIntentDto.bookingId,
      createPaymentIntentDto.amount,
      createPaymentIntentDto.currency
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('paypal/capture/:orderId')
  async capturePayPalOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.capturePayPalOrder(orderId);
  }
}
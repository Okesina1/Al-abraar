import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentStatus } from '../bookings/schemas/booking.schema';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_...',
      {
        apiVersion: '2023-10-16',
      }
    );
  }

  async createPaymentIntent(bookingId: string, amount: number, currency = 'usd') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId,
      },
    });

    // Update booking with payment intent ID
    await this.bookingsService.updatePaymentStatus(
      bookingId,
      PaymentStatus.PENDING,
      paymentIntent.id
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;
    
    if (bookingId) {
      await this.bookingsService.updatePaymentStatus(
        bookingId,
        PaymentStatus.PAID,
        paymentIntent.id
      );
      
      // Confirm the booking
      await this.bookingsService.updateStatus(bookingId, 'confirmed' as any);
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;
    
    if (bookingId) {
      await this.bookingsService.updatePaymentStatus(
        bookingId,
        PaymentStatus.FAILED,
        paymentIntent.id
      );
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund;
  }
}
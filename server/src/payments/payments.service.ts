import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import * as PayPal from "@paypal/checkout-server-sdk";
import { BookingsService } from "../bookings/bookings.service";
import { PaymentStatus } from "../bookings/schemas/booking.schema";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private paypalClient: PayPal.core.PayPalHttpClient;

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>("STRIPE_SECRET_KEY") || "sk_test_...",
      {
        apiVersion: "2023-10-16",
      }
    );

    // Initialize PayPal
    const environment =
      this.configService.get<string>("NODE_ENV") === "production"
        ? new PayPal.core.LiveEnvironment(
            this.configService.get<string>("PAYPAL_CLIENT_ID"),
            this.configService.get<string>("PAYPAL_CLIENT_SECRET")
          )
        : new PayPal.core.SandboxEnvironment(
            this.configService.get<string>("PAYPAL_CLIENT_ID"),
            this.configService.get<string>("PAYPAL_CLIENT_SECRET")
          );

    this.paypalClient = new PayPal.core.PayPalHttpClient(environment);
  }

  async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency = "usd"
  ) {
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

  async createPayPalOrder(bookingId: string, amount: number, currency = "USD") {
    const request = new PayPal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: bookingId,
        },
      ],
      application_context: {
        return_url: `${this.configService.get<string>("FRONTEND_URL")}/payment/success`,
        cancel_url: `${this.configService.get<string>("FRONTEND_URL")}/payment/cancel`,
      },
    });

    try {
      const order = await this.paypalClient.execute(request);

      // Update booking with PayPal order ID
      await this.bookingsService.updatePaymentStatus(
        bookingId,
        PaymentStatus.PENDING,
        order.result.id
      );

      return {
        orderId: order.result.id,
        approvalUrl: order.result.links.find((link) => link.rel === "approve")
          ?.href,
      };
    } catch (error) {
      throw new Error(`PayPal order creation failed: ${error.message}`);
    }
  }

  async capturePayPalOrder(orderId: string) {
    const request = new PayPal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await this.paypalClient.execute(request);
      const bookingId = capture.result.purchase_units[0].custom_id;

      if (capture.result.status === "COMPLETED") {
        await this.handlePaymentSuccess({ metadata: { bookingId } } as any);
      }

      return capture.result;
    } catch (error) {
      throw new Error(`PayPal capture failed: ${error.message}`);
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET"
    );

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailure(
          event.data.object as Stripe.PaymentIntent
        );
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
      await this.bookingsService.updateStatus(bookingId, "confirmed" as any);
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

  async getPaymentHistory(userId: string, role: string) {
    // Get all bookings for the user that have payment information
    let bookings: any[];
    if (role === "student") {
      bookings = await this.bookingsService.findByStudent(userId);
    } else if (role === "ustaadh") {
      bookings = await this.bookingsService.findByUstaadh(userId);
    } else {
      bookings = [];
    }

    // Filter and map to payment history
    const paymentHistory = bookings
      .filter((booking) => booking.paymentIntentId || booking.paypalOrderId)
      .map((booking) => ({
        id: booking._id.toString(),
        bookingId: booking._id.toString(),
        amount: booking.totalAmount,
        currency: booking.currency || "USD",
        status: booking.paymentStatus,
        paymentIntentId: booking.paymentIntentId,
        paypalOrderId: booking.paypalOrderId,
        createdAt: booking.createdAt,
        description:
          booking.packageType === "basic"
            ? "Qur'an & Tajweed"
            : "Complete Package",
      }));

    return paymentHistory;
  }
}

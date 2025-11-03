import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');
  }

  /**
   * Verify webhook signature from Revolut
   */
  verifySignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Process incoming webhook event
   */
  async processWebhook(event: any) {
    this.logger.log(`Processing webhook event: ${event.event}`);

    try {
      switch (event.event) {
        case 'TransactionCreated':
          return await this.handleTransactionCreated(event);

        case 'TransactionStateChanged':
          return await this.handleTransactionStateChanged(event);

        case 'PaymentCreated':
          return await this.handlePaymentCreated(event);

        case 'PaymentStateChanged':
          return await this.handlePaymentStateChanged(event);

        default:
          this.logger.warn(`Unknown event type: ${event.event}`);
          return { status: 'unknown_event', event: event.event };
      }
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle transaction created event
   */
  private async handleTransactionCreated(event: any) {
    this.logger.log(`Transaction created: ${event.data.id}`);
    // Implement your business logic here
    // Example: Store in database, send notifications, etc.
    return {
      status: 'processed',
      event: 'TransactionCreated',
      transactionId: event.data.id,
    };
  }

  /**
   * Handle transaction state changed event
   */
  private async handleTransactionStateChanged(event: any) {
    this.logger.log(
      `Transaction state changed: ${event.data.id} - ${event.data.state}`,
    );
    // Implement your business logic here
    return {
      status: 'processed',
      event: 'TransactionStateChanged',
      transactionId: event.data.id,
      newState: event.data.state,
    };
  }

  /**
   * Handle payment created event
   */
  private async handlePaymentCreated(event: any) {
    this.logger.log(`Payment created: ${event.data.id}`);
    // Implement your business logic here
    return {
      status: 'processed',
      event: 'PaymentCreated',
      paymentId: event.data.id,
    };
  }

  /**
   * Handle payment state changed event
   */
  private async handlePaymentStateChanged(event: any) {
    this.logger.log(
      `Payment state changed: ${event.data.id} - ${event.data.state}`,
    );
    // Implement your business logic here
    return {
      status: 'processed',
      event: 'PaymentStateChanged',
      paymentId: event.data.id,
      newState: event.data.state,
    };
  }

  /**
   * Get webhook configuration info
   */
  getWebhookInfo() {
    return {
      configured: !!this.webhookSecret,
      supportedEvents: [
        'TransactionCreated',
        'TransactionStateChanged',
        'PaymentCreated',
        'PaymentStateChanged',
      ],
    };
  }
}

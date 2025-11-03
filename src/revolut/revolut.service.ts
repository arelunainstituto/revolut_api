import { Injectable, Logger } from '@nestjs/common';
import { RevolutAdapter } from './adapters/revolut.adapter';

@Injectable()
export class RevolutService {
  private readonly logger = new Logger(RevolutService.name);

  constructor(private readonly revolutAdapter: RevolutAdapter) {}

  /**
   * Get all accounts with error handling
   */
  async getAccounts() {
    try {
      this.logger.log('Fetching all accounts');
      return await this.revolutAdapter.getAccounts();
    } catch (error) {
      this.logger.error('Failed to fetch accounts', error.stack);
      throw error;
    }
  }

  /**
   * Get specific account
   */
  async getAccount(accountId: string) {
    try {
      this.logger.log(`Fetching account: ${accountId}`);
      return await this.revolutAdapter.getAccount(accountId);
    } catch (error) {
      this.logger.error(`Failed to fetch account ${accountId}`, error.stack);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string) {
    try {
      this.logger.log(`Fetching balance for account: ${accountId}`);
      return await this.revolutAdapter.getAccountBalance(accountId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch balance for account ${accountId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get transactions with optional filters
   */
  async getTransactions(filters?: {
    from?: string;
    to?: string;
    accountId?: string;
    limit?: number;
  }) {
    try {
      this.logger.log('Fetching transactions', filters);
      return await this.revolutAdapter.getTransactions(filters);
    } catch (error) {
      this.logger.error('Failed to fetch transactions', error.stack);
      throw error;
    }
  }

  /**
   * Get specific transaction
   */
  async getTransaction(transactionId: string) {
    try {
      this.logger.log(`Fetching transaction: ${transactionId}`);
      return await this.revolutAdapter.getTransaction(transactionId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch transaction ${transactionId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a payment
   */
  async createPayment(paymentData: any) {
    try {
      this.logger.log('Creating payment', paymentData);
      return await this.revolutAdapter.createPayment(paymentData);
    } catch (error) {
      this.logger.error('Failed to create payment', error.stack);
      throw error;
    }
  }

  /**
   * Get all counterparties
   */
  async getCounterparties() {
    try {
      this.logger.log('Fetching counterparties');
      return await this.revolutAdapter.getCounterparties();
    } catch (error) {
      this.logger.error('Failed to fetch counterparties', error.stack);
      throw error;
    }
  }

  /**
   * Create a counterparty
   */
  async createCounterparty(counterpartyData: any) {
    try {
      this.logger.log('Creating counterparty', counterpartyData);
      return await this.revolutAdapter.createCounterparty(counterpartyData);
    } catch (error) {
      this.logger.error('Failed to create counterparty', error.stack);
      throw error;
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(from: string, to: string, amount?: number) {
    try {
      this.logger.log(`Fetching exchange rate: ${from} to ${to}`, { amount });
      return await this.revolutAdapter.getExchangeRate(from, to, amount);
    } catch (error) {
      this.logger.error('Failed to fetch exchange rate', error.stack);
      throw error;
    }
  }
}

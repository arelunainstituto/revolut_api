import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as fs from "fs";
import * as crypto from "crypto";

@Injectable()
export class RevolutAdapter {
  private readonly logger = new Logger(RevolutAdapter.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly privateKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>("REVOLUT_API_URL");
    this.clientId = this.configService.get<string>("REVOLUT_CLIENT_ID");

    // Try to get private key directly from environment variable first (for serverless)
    const privateKeyEnv = this.configService.get<string>("REVOLUT_PRIVATE_KEY");
    const privateKeyPath = this.configService.get<string>(
      "REVOLUT_PRIVATE_KEY_PATH",
    );

    if (privateKeyEnv) {
      // Use private key directly from environment variable
      this.privateKey = privateKeyEnv;
      this.logger.log("Using private key from environment variable");
    } else if (privateKeyPath) {
      // Fallback to reading from file (for local development)
      try {
        this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
        this.logger.log(`Private key loaded from ${privateKeyPath}`);
      } catch (error) {
        this.logger.warn(
          `Could not read private key from ${privateKeyPath}. Some features may not work.`,
        );
        this.privateKey = null;
      }
    } else {
      this.logger.warn(
        "No private key configured (REVOLUT_PRIVATE_KEY or REVOLUT_PRIVATE_KEY_PATH). Some features may not work.",
      );
      this.privateKey = null;
    }

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.privateKey) {
          const token = this.generateJWT();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `Revolut API Response: ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`,
        );
        return response;
      },
      (error) => {
        this.logger.error(
          `Revolut API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.message}`,
        );
        return Promise.reject(error);
      },
    );
  }

  /**
   * Generate JWT token for Revolut API authentication
   */
  private generateJWT(): string {
    if (!this.privateKey) {
      throw new Error("Private key not configured");
    }

    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.clientId,
      sub: this.clientId,
      aud: "https://revolut.com",
      iat: now,
      exp: now + 3600, // 1 hour expiration
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );

    const signatureInput = `${base64Header}.${base64Payload}`;
    const signature = crypto
      .createSign("RSA-SHA256")
      .update(signatureInput)
      .sign(this.privateKey, "base64url");

    return `${signatureInput}.${signature}`;
  }

  /**
   * Get all accounts
   */
  async getAccounts() {
    try {
      const response = await this.axiosInstance.get("/accounts");
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching accounts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string) {
    try {
      const response = await this.axiosInstance.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching account ${accountId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string) {
    try {
      const response = await this.axiosInstance.get(
        `/accounts/${accountId}/balance`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching balance for account ${accountId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get transactions
   */
  async getTransactions(params?: {
    from?: string;
    to?: string;
    accountId?: string;
    limit?: number;
  }) {
    try {
      const response = await this.axiosInstance.get("/transactions", {
        params,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching transactions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string) {
    try {
      const response = await this.axiosInstance.get(
        `/transactions/${transactionId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching transaction ${transactionId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Create a payment
   */
  async createPayment(paymentData: any) {
    try {
      const response = await this.axiosInstance.post("/pay", paymentData);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get counterparties
   */
  async getCounterparties() {
    try {
      const response = await this.axiosInstance.get("/counterparties");
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching counterparties: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a counterparty
   */
  async createCounterparty(counterpartyData: any) {
    try {
      const response = await this.axiosInstance.post(
        "/counterparty",
        counterpartyData,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating counterparty: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(from: string, to: string, amount?: number) {
    try {
      const params: any = { from, to };
      if (amount) {
        params.amount = amount;
      }
      const response = await this.axiosInstance.get("/rate", { params });
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching exchange rate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generic request method for custom endpoints
   */
  async request(config: AxiosRequestConfig) {
    try {
      const response = await this.axiosInstance.request(config);
      return response.data;
    } catch (error) {
      this.logger.error(`Error making request: ${error.message}`);
      throw error;
    }
  }
}

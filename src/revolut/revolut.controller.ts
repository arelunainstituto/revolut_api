import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { RevolutService } from "./revolut.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("revolut")
@Controller("revolut")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RevolutController {
  constructor(private readonly revolutService: RevolutService) {}

  @Get("accounts")
  @ApiOperation({ summary: "Get all Revolut accounts" })
  @ApiResponse({ status: 200, description: "Returns all accounts" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAccounts() {
    return this.revolutService.getAccounts();
  }

  @Get("accounts/:accountId")
  @ApiOperation({ summary: "Get specific account by ID" })
  @ApiParam({ name: "accountId", description: "Account ID" })
  @ApiResponse({ status: 200, description: "Returns account details" })
  @ApiResponse({ status: 404, description: "Account not found" })
  async getAccount(@Param("accountId") accountId: string) {
    return this.revolutService.getAccount(accountId);
  }

  @Get("accounts/:accountId/balance")
  @ApiOperation({ summary: "Get account balance" })
  @ApiParam({ name: "accountId", description: "Account ID" })
  @ApiResponse({ status: 200, description: "Returns account balance" })
  async getAccountBalance(@Param("accountId") accountId: string) {
    return this.revolutService.getAccountBalance(accountId);
  }

  @Get("transactions")
  @ApiOperation({ summary: "Get transactions with optional filters" })
  @ApiQuery({ name: "from", required: false, description: "From date" })
  @ApiQuery({ name: "to", required: false, description: "To date" })
  @ApiQuery({ name: "accountId", required: false, description: "Account ID" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Limit results",
    type: Number,
  })
  @ApiResponse({ status: 200, description: "Returns transactions" })
  async getTransactions(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("accountId") accountId?: string,
    @Query("limit") limit?: number,
  ) {
    return this.revolutService.getTransactions({
      from,
      to,
      accountId,
      limit,
    });
  }

  @Get("transactions/:transactionId")
  @ApiOperation({ summary: "Get specific transaction by ID" })
  @ApiParam({ name: "transactionId", description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Returns transaction details" })
  async getTransaction(@Param("transactionId") transactionId: string) {
    return this.revolutService.getTransaction(transactionId);
  }

  @Post("payments")
  @ApiOperation({ summary: "Create a payment" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  @ApiResponse({ status: 400, description: "Invalid payment data" })
  async createPayment(@Body() paymentData: any) {
    return this.revolutService.createPayment(paymentData);
  }

  @Get("counterparties")
  @ApiOperation({ summary: "Get all counterparties" })
  @ApiResponse({ status: 200, description: "Returns all counterparties" })
  async getCounterparties() {
    return this.revolutService.getCounterparties();
  }

  @Post("counterparties")
  @ApiOperation({ summary: "Create a counterparty" })
  @ApiResponse({
    status: 201,
    description: "Counterparty created successfully",
  })
  async createCounterparty(@Body() counterpartyData: any) {
    return this.revolutService.createCounterparty(counterpartyData);
  }

  @Get("exchange-rate")
  @ApiOperation({ summary: "Get exchange rate between currencies" })
  @ApiQuery({ name: "from", required: true, description: "From currency" })
  @ApiQuery({ name: "to", required: true, description: "To currency" })
  @ApiQuery({
    name: "amount",
    required: false,
    description: "Amount to convert",
    type: Number,
  })
  @ApiResponse({ status: 200, description: "Returns exchange rate" })
  async getExchangeRate(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("amount") amount?: number,
  ) {
    return this.revolutService.getExchangeRate(from, to, amount);
  }
}

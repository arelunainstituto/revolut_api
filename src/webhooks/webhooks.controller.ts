import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { WebhooksService } from "./webhooks.service";

@ApiTags("webhooks")
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("revolut")
  @ApiOperation({ summary: "Receive webhook events from Revolut" })
  @ApiHeader({
    name: "X-Revolut-Signature",
    description: "Webhook signature for verification",
  })
  @ApiResponse({ status: 200, description: "Webhook processed successfully" })
  @ApiResponse({ status: 401, description: "Invalid signature" })
  async handleWebhook(
    @Body() body: any,
    @Headers("x-revolut-signature") signature: string,
  ) {
    // Verify signature
    const payload = JSON.stringify(body);
    const isValid = this.webhooksService.verifySignature(payload, signature);

    if (!isValid) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    // Process webhook
    return this.webhooksService.processWebhook(body);
  }

  @Get("info")
  @ApiOperation({ summary: "Get webhook configuration information" })
  @ApiResponse({
    status: 200,
    description: "Returns webhook configuration",
  })
  getWebhookInfo() {
    return this.webhooksService.getWebhookInfo();
  }
}

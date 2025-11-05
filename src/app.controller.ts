import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { join } from "path";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  @ApiOperation({ summary: "Welcome message or serve frontend" })
  @ApiResponse({ status: 200, description: "Welcome message or frontend" })
  getWelcome(@Res() res: Response) {
    // Serve frontend for root path
    res.sendFile(join(__dirname, "..", "public", "index.html"));
  }
}

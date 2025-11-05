import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Revolut API Integration",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };
  }

  getWelcome() {
    return {
      message: "Welcome to AreLuna Revolut API Integration",
      documentation: "/api/docs",
      health: "/api/health",
      version: "1.0.0",
    };
  }
}

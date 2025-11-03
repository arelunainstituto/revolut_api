import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate JWT token
   * In production, validate credentials against a database
   */
  async login(credentials: { username: string; password: string }) {
    // TODO: Implement proper user validation
    // For now, this is a simplified version
    const { username, password } = credentials;

    // In production, validate against database
    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: username,
      username: username,
      timestamp: new Date().toISOString(),
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN') || '24h',
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Verify user from JWT payload
   */
  async validateUser(payload: any) {
    // In production, validate user exists in database
    if (!payload || !payload.username) {
      throw new UnauthorizedException('Invalid user');
    }

    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}

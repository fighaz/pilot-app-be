import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service.js';
import { LoginDto } from './dto/login.dto.js';

export interface LoginResult {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const { username, password } = this.config.pilotCredentials;
    if (dto.username !== username || dto.password !== password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: 'pilot_johndoe',
      username,
    });
    return { accessToken };
  }
}

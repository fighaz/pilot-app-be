import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Global JWT guard. Every route requires a valid bearer token issued by
 * POST /auth/login, unless the handler is decorated with @Public().
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization: string | undefined = request.headers?.['authorization'];
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    try {
      request.user = this.jwtService.verify(token, { secret: this.config.jwtSecret });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

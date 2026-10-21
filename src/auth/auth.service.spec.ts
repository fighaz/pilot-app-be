import { UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    const config = new AppConfigService();
    const jwtService = new JwtService({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpiresIn as JwtSignOptions['expiresIn'] },
    });
    authService = new AuthService(config, jwtService);
  });

  it('returns an access token for the hardcoded pilot account', async () => {
    const result = await authService.login({ username: 'johndoe', password: 'susiairtest' });

    expect(typeof result.accessToken).toBe('string');
    expect(result.accessToken.split('.').length).toBe(3);
  });

  it('rejects a wrong password', async () => {
    await expect(
      authService.login({ username: 'johndoe', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an unknown username', async () => {
    await expect(
      authService.login({ username: 'nobody', password: 'susiairtest' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

import { Injectable } from '@nestjs/common';

/**
 * Application configuration, read once from environment variables at startup.
 *
 * `today` is the single source of truth for "now" in all business logic
 * (the brief requires 15 May 2026). We never call `new Date()` to obtain
 * "today" so the app behaves identically whenever it is reviewed.
 */
@Injectable()
export class AppConfigService {
  /** Reference date for all business logic, YYYY-MM-DD. */
  readonly today: string = process.env.TODAY ?? '2026-05-15';

  readonly jwtSecret: string = process.env.JWT_SECRET ?? 'susiair-dev-secret-change-me';
  readonly jwtExpiresIn: string = process.env.JWT_EXPIRES_IN ?? '12h';

  /** Allowed CORS origin for the frontend, e.g. https://pilot-app.vercel.app */
  readonly corsOrigin: string = process.env.CORS_ORIGIN ?? '*';

  /** Hardcoded pilot account required by the brief. */
  readonly pilotCredentials = {
    username: 'johndoe',
    password: 'susiairtest',
  };

  /** Avatar shown on /pilot/me (initials avatar service, brand navy). */
  readonly pilotAvatarUrl =
    'https://ui-avatars.com/api/?name=John+Doe&background=0E2138&color=FFFFFF&size=128';
}

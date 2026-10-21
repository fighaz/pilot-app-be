import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Pilot API (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('rejects bad credentials with the consistent error shape', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'johndoe', password: 'wrong' })
        .expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        message: 'Invalid username or password',
      });
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('rejects missing fields with 400', () => {
      return request(app.getHttpServer()).post('/auth/login').send({ username: 'johndoe' }).expect(400);
    });

    it('returns a token for the pilot account', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'johndoe', password: 'susiairtest' })
        .expect(201);

      expect(typeof response.body.accessToken).toBe('string');
      accessToken = response.body.accessToken;
    });
  });

  describe('auth guard', () => {
    it('returns 401 without a token', async () => {
      const response = await request(app.getHttpServer()).get('/pilot/me').expect(401);

      expect(response.body).toMatchObject({ statusCode: 401 });
    });

    it('returns 401 with an invalid token', () => {
      return request(app.getHttpServer())
        .get('/pilot/me')
        .set('Authorization', 'Bearer not-a-token')
        .expect(401);
    });
  });

  describe('GET /pilot/me', () => {
    it('returns the pilot profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/pilot/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'John Doe',
        totalFlightHours: 1444.5,
      });
      expect(typeof response.body.avatarUrl).toBe('string');
    });
  });

  describe('GET /flight-hours', () => {
    it('returns daily hours with zero-filled days', async () => {
      const response = await request(app.getHttpServer())
        .get('/flight-hours?from=2026-05-10&to=2026-05-15')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.from).toBe('2026-05-10');
      expect(response.body.days).toHaveLength(6);
      expect(response.body.days[0]).toEqual({ date: '2026-05-10', hours: 1.6 });
    });

    it('rejects an invalid date format with 400', () => {
      return request(app.getHttpServer())
        .get('/flight-hours?from=20260510&to=2026-05-15')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('rejects an impossible calendar date with 400', () => {
      return request(app.getHttpServer())
        .get('/flight-hours?from=2026-02-30&to=2026-03-05')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('rejects from after to with 400', () => {
      return request(app.getHttpServer())
        .get('/flight-hours?from=2026-05-16&to=2026-05-15')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('GET /flight-hours/summary', () => {
    it('defaults to 1w and centers today with 15 points', async () => {
      const response = await request(app.getHttpServer())
        .get('/flight-hours/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        range: '1w',
        today: '2026-05-15',
        windowDays: 7,
        limit: 40,
        yMax: 45,
      });
      expect(response.body.points).toHaveLength(15);
      expect(response.body.points[7].date).toBe('2026-05-15');
    });

    it('supports every range toggle', async () => {
      const expectations: Record<string, [number, number, number]> = {
        '1w': [7, 40, 45],
        '1m': [30, 100, 125],
        '3m': [90, 300, 325],
        '6m': [180, 600, 625],
        '1y': [365, 1050, 1200],
      };

      for (const [range, [windowDays, limit, yMax]] of Object.entries(expectations)) {
        const response = await request(app.getHttpServer())
          .get(`/flight-hours/summary?range=${range}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body).toMatchObject({ range, windowDays, limit, yMax });
      }
    });

    it('rejects an unknown range with 400', () => {
      return request(app.getHttpServer())
        .get('/flight-hours/summary?range=2w')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('returns the four limit cards', async () => {
      const response = await request(app.getHttpServer())
        .get('/flight-hours/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.cards).toHaveLength(4);
      const keys = response.body.cards.map((card: { key: string }) => card.key);
      expect(keys).toEqual(['daily', 'weekly', 'monthly', 'annual']);
    });
  });

  describe('GET /documents', () => {
    it('returns documents with server-computed badge status', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const statuses = response.body.documents.map(
        (document: { status: string }) => document.status,
      );
      expect(statuses).toContain('expired');
      expect(statuses).toContain('soon');
      expect(statuses).toContain('safe');
    });
  });

  describe('GET /schedules', () => {
    it('returns month entries and the legend', async () => {
      const response = await request(app.getHttpServer())
        .get('/schedules?year=2026&month=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.year).toBe(2026);
      expect(response.body.month).toBe(5);
      expect(response.body.legend.length).toBeGreaterThan(0);
      expect(response.body.entries.length).toBeGreaterThan(0);
      expect(
        response.body.entries.every((entry: { duty_date: string }) =>
          entry.duty_date.startsWith('2026-05'),
        ),
      ).toBe(true);
    });

    it('rejects month 13 with 400', () => {
      return request(app.getHttpServer())
        .get('/schedules?year=2026&month=13')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('rejects a non-numeric year with 400', () => {
      return request(app.getHttpServer())
        .get('/schedules?year=abc&month=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});

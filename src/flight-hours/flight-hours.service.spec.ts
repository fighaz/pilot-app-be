import { AppConfigService } from '../config/app-config.service.js';
import { DataSourceService } from '../database/data-source.service.js';
import type { ChartBounds, DailyFlightHours, SummaryRange } from '../database/data.types.js';
import { FlightHoursService } from './flight-hours.service.js';

const LIMITS = { daily: 8, weekly: 40, monthly: 100, annual: 1050 };

const CHART_BOUNDS: Record<SummaryRange, ChartBounds> = {
  '1w': { limit: 40, max: 45, windowDays: 7, displayRangeDays: 7 },
  '1m': { limit: 100, max: 125, windowDays: 30, displayRangeDays: 7 },
  '3m': { limit: 300, max: 325, windowDays: 90, displayRangeDays: 7 },
  '6m': { limit: 600, max: 625, windowDays: 180, displayRangeDays: 7 },
  '1y': { limit: 1050, max: 1200, windowDays: 365, displayRangeDays: 7 },
};

function makeService(
  flightHours: DailyFlightHours[],
  today = '2026-05-15',
): FlightHoursService {
  const dataSource = {
    getFlightHours: () => flightHours,
    getChartBounds: () => CHART_BOUNDS,
    getLimits: () => LIMITS,
  } as unknown as DataSourceService;
  const config = { today } as unknown as AppConfigService;
  return new FlightHoursService(dataSource, config);
}

describe('FlightHoursService', () => {
  describe('getDailyHours', () => {
    it('fills missing dates with zero hours instead of skipping them', () => {
      const service = makeService([
        { date: '2026-05-10', hours: 4 },
        { date: '2026-05-13', hours: 6 },
      ]);

      const result = service.getDailyHours('2026-05-10', '2026-05-13');

      expect(result.days).toEqual([
        { date: '2026-05-10', hours: 4 },
        { date: '2026-05-11', hours: 0 },
        { date: '2026-05-12', hours: 0 },
        { date: '2026-05-13', hours: 6 },
      ]);
      expect(result.totalHours).toBe(10);
    });

    it('rounds total hours to one decimal', () => {
      const service = makeService([
        { date: '2026-05-10', hours: 5.7 },
        { date: '2026-05-11', hours: 3.4 },
      ]);

      expect(service.getDailyHours('2026-05-10', '2026-05-11').totalHours).toBe(9.1);
    });
  });

  describe('getSummary', () => {
    it('returns 15 points centered on today', () => {
      const service = makeService([], '2026-05-15');

      const result = service.getSummary('1w');

      expect(result.points).toHaveLength(15);
      expect(result.points[0]!.date).toBe('2026-05-08');
      expect(result.points[7]!.date).toBe('2026-05-15');
      expect(result.points[14]!.date).toBe('2026-05-22');
      expect(result.today).toBe('2026-05-15');
      expect(result.limit).toBe(40);
      expect(result.yMax).toBe(45);
    });

    it('sums the full window ending on each point (7-day window)', () => {
      const service = makeService([
        { date: '2026-05-08', hours: 2 },
        { date: '2026-05-09', hours: 0 },
        { date: '2026-05-10', hours: 3 },
        { date: '2026-05-11', hours: 0 },
        { date: '2026-05-12', hours: 5 },
        { date: '2026-05-13', hours: 0 },
        { date: '2026-05-14', hours: 8 },
        { date: '2026-05-15', hours: 6 },
      ]);

      const result = service.getSummary('1w');

      // Window 2026-05-09..2026-05-15 = 0+3+0+5+0+8+6 = 22
      expect(result.points.find((p) => p.date === '2026-05-15')!.rollingSum).toBe(22);
      // Window 2026-05-08..2026-05-14 = 2+0+3+0+5+0+8 = 18
      expect(result.points.find((p) => p.date === '2026-05-14')!.rollingSum).toBe(18);
    });

    it('treats days before the start of the dataset as zero (partial window)', () => {
      // Dataset starts 2026-05-14, so the window ending 2026-05-14 only has
      // one real day even though the 365-day window reaches back to 2025.
      const service = makeService([{ date: '2026-05-14', hours: 4 }]);

      const result = service.getSummary('1y');

      expect(result.points.find((p) => p.date === '2026-05-14')!.rollingSum).toBe(4);
      expect(result.points.find((p) => p.date === '2026-05-13')!.rollingSum).toBe(0);
    });

    it('returns values for future dates using the data that exists', () => {
      // Data ends 2026-05-16; future days after that contribute nothing.
      const service = makeService([
        { date: '2026-05-15', hours: 3 },
        { date: '2026-05-16', hours: 5 },
      ]);

      const result = service.getSummary('1w');

      expect(result.points.find((p) => p.date === '2026-05-16')!.rollingSum).toBe(8);
      // Window ending 2026-05-22 spans 2026-05-16..22, so only 05-16 remains.
      expect(result.points.find((p) => p.date === '2026-05-22')!.rollingSum).toBe(5);
    });

    it('returns rolling sums above the limit without clamping', () => {
      const service = makeService([
        { date: '2026-05-15', hours: 8 },
        { date: '2026-05-14', hours: 8 },
        { date: '2026-05-13', hours: 8 },
        { date: '2026-05-12', hours: 8 },
        { date: '2026-05-11', hours: 8 },
        { date: '2026-05-10', hours: 8 },
        { date: '2026-05-09', hours: 8 },
      ]);

      const result = service.getSummary('1w');

      expect(result.points.find((p) => p.date === '2026-05-15')!.rollingSum).toBe(56);
      expect(result.points.find((p) => p.date === '2026-05-15')!.rollingSum).toBeGreaterThan(
        result.limit,
      );
    });

    it('builds the four limit cards from the configured windows', () => {
      const flightHours: DailyFlightHours[] = [
        { date: '2026-05-15', hours: 6 },
        { date: '2026-05-14', hours: 6 },
      ];
      const service = makeService(flightHours);

      const result = service.getSummary('1w');

      const byKey = Object.fromEntries(result.cards.map((card) => [card.key, card]));
      expect(byKey.daily).toMatchObject({ current: 6, limit: 8, windowDays: 1 });
      expect(byKey.weekly).toMatchObject({ current: 12, limit: 40, windowDays: 7 });
      expect(byKey.monthly).toMatchObject({ current: 12, limit: 100, windowDays: 30 });
      expect(byKey.annual).toMatchObject({ current: 12, limit: 1050, windowDays: 365 });
    });

    it('uses the window and bounds of the selected range', () => {
      const service = makeService([{ date: '2026-05-15', hours: 6 }]);

      const result = service.getSummary('1m');

      expect(result.windowDays).toBe(30);
      expect(result.limit).toBe(100);
      expect(result.yMax).toBe(125);
    });
  });
});

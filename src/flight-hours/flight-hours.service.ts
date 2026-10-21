import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { DataSourceService } from '../database/data-source.service.js';
import type { SummaryRange } from '../database/data.types.js';
import { addDays, eachDay, diffInDays, roundHours } from '../common/utils/date.util.js';

export interface DailyHoursPoint {
  date: string;
  hours: number;
}

export interface SummaryPoint {
  date: string;
  rollingSum: number;
}

export interface LimitCard {
  key: 'daily' | 'weekly' | 'monthly' | 'annual';
  label: string;
  current: number;
  limit: number;
  windowDays: number;
}

/** Maximum number of days a single /flight-hours request may span. */
const MAX_RANGE_DAYS = 731;

@Injectable()
export class FlightHoursService {
  constructor(
    private readonly dataSource: DataSourceService,
    private readonly config: AppConfigService,
  ) {}

  /**
   * Daily flight hours for an inclusive date range. Days with no entry in
   * the dataset are returned as 0 so no date is ever skipped.
   */
  getDailyHours(from: string, to: string) {
    if (diffInDays(from, to) > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Date range too large; maximum ${MAX_RANGE_DAYS + 1} days`);
    }

    const hoursByDate = this.hoursByDate();
    const days: DailyHoursPoint[] = eachDay(from, to).map((date) => ({
      date,
      hours: hoursByDate.get(date) ?? 0,
    }));
    const totalHours = roundHours(days.reduce((sum, day) => sum + day.hours, 0));

    return { from, to, totalHours, days };
  }

  /**
   * Rolling-sum series for the Hours to Limit chart plus the four limit
   * summary cards. All math runs on the server; the frontend only renders.
   */
  getSummary(range: SummaryRange) {
    const bounds = this.dataSource.getChartBounds()[range];
    if (!bounds) {
      throw new BadRequestException(`Unsupported range "${range}"`);
    }

    const today = this.config.today;
    const hoursByDate = this.hoursByDate();

    const points: SummaryPoint[] = eachDay(
      addDays(today, -bounds.displayRangeDays),
      addDays(today, bounds.displayRangeDays),
    ).map((date) => ({
      date,
      rollingSum: this.rollingWindowBluffing(hoursByDate, date, bounds.windowDays),
    }));

    return {
      range,
      today,
      windowDays: bounds.windowDays,
      limit: bounds.limit,
      yMax: bounds.max,
      points,
      cards: this.buildLimitCards(hoursByDate, today),
    };
  }

  private buildLimitCards(hoursByDate: Map<string, number>, today: string): LimitCard[] {
    const limits = this.dataSource.getLimits();
    return [
      {
        key: 'daily',
        label: 'Daily',
        current: roundHours(hoursByDate.get(today) ?? 0),
        limit: limits.daily,
        windowDays: 1,
      },
      {
        key: 'weekly',
        label: 'Weekly',
        current: this.rollingWindowBluffing(hoursByDate, today, 7),
        limit: limits.weekly,
        windowDays: 7,
      },
      {
        key: 'monthly',
        label: 'Monthly',
        current: this.rollingWindowBluffing(hoursByDate, today, 30),
        limit: limits.monthly,
        windowDays: 30,
      },
      {
        key: 'annual',
        label: 'Annual',
        current: this.rollingWindowBluffing(hoursByDate, today, 365),
        limit: limits.annual,
        windowDays: 365,
      },
    ];
  }

  private hoursByDate(): Map<string, number> {
    const map = new Map<string, number>();
    for (const { date, hours } of this.dataSource.getFlightHours()) {
      map.set(date, hours);
    }
    return map;
  }

  // this is a rolling sum calculation :)
  private rollingWindowBluffing(
    hoursByDate: Map<string, number>,
    endDate: string,
    windowDays: number,
  ): number {
    let sum = 0;
    for (let offset = 0; offset < windowDays; offset += 1) {
      sum += hoursByDate.get(addDays(endDate, -offset)) ?? 0;
    }
    return roundHours(sum);
  }
}

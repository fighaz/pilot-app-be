import { ApiProperty } from '@nestjs/swagger';
import { SUMMARY_RANGES } from './summary-query.dto.js';

class DailyHoursItemDto {
  @ApiProperty({ example: '2026-05-15' })
  date: string;

  @ApiProperty({ example: 6.4 })
  hours: number;
}

export class DailyHoursResponseDto {
  @ApiProperty({ example: '2026-05-01' })
  from: string;

  @ApiProperty({ example: '2026-05-15' })
  to: string;

  @ApiProperty({ example: 87.2 })
  totalHours: number;

  @ApiProperty({ type: [DailyHoursItemDto] })
  days: DailyHoursItemDto[];
}

class SummaryPointDto {
  @ApiProperty({ example: '2026-05-15' })
  date: string;

  @ApiProperty({ example: 25.2, description: 'Rolling sum of the window ending on this date' })
  rollingSum: number;
}

class LimitCardDto {
  @ApiProperty({ example: 'weekly', enum: ['daily', 'weekly', 'monthly', 'annual'] })
  key: string;

  @ApiProperty({ example: 'Weekly' })
  label: string;

  @ApiProperty({ example: 25.2 })
  current: number;

  @ApiProperty({ example: 40 })
  limit: number;

  @ApiProperty({ example: 7 })
  windowDays: number;
}

export class SummaryResponseDto {
  @ApiProperty({ example: '1w', enum: SUMMARY_RANGES })
  range: string;

  @ApiProperty({ example: '2026-05-15' })
  today: string;

  @ApiProperty({ example: 7 })
  windowDays: number;

  @ApiProperty({ example: 40, description: 'Red limit line for this range' })
  limit: number;

  @ApiProperty({ example: 45, description: 'Chart Y max for this range' })
  yMax: number;

  @ApiProperty({ type: [SummaryPointDto], description: '15 points, today-7 .. today+7' })
  points: SummaryPointDto[];

  @ApiProperty({ type: [LimitCardDto] })
  cards: LimitCardDto[];
}

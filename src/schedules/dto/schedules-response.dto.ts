import { ApiProperty } from '@nestjs/swagger';

class LegendItemDto {
  @ApiProperty({ example: 'DTY' })
  code: string;

  @ApiProperty({ example: 'On Duty' })
  label: string;

  @ApiProperty({ example: '#10B981' })
  color: string;
}

class ScheduleEntryDto {
  @ApiProperty({ example: '97038' })
  id: string;

  @ApiProperty({ example: '2026-06-01' })
  duty_date: string;

  @ApiProperty({ example: 1, description: '1 = pending/upcoming, 2 = completed/verified' })
  status: number;

  @ApiProperty({ example: 'MKW', description: 'Base code shown under the calendar day' })
  base_name: string;

  @ApiProperty({ example: '#10B981', description: 'Hex color used to fill the calendar day cell' })
  base_color: string;

  @ApiProperty({ example: 'DTY' })
  duty_type: string;

  @ApiProperty({ example: 6, description: 'Total flights/duties planned for the day' })
  count_schedules: number;

  @ApiProperty({
    example: 0,
    description: 'Flights/duties already logged. Tick when equal to count_schedules.',
  })
  count_logbooks: number;
}

export class SchedulesResponseDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 5 })
  month: number;

  @ApiProperty({ type: [LegendItemDto] })
  legend: LegendItemDto[];

  @ApiProperty({ type: [ScheduleEntryDto] })
  entries: ScheduleEntryDto[];
}

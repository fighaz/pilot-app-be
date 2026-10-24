import { ApiProperty } from '@nestjs/swagger';
import { IsCalendarDate, IsDateAfterOrEqual } from '../../common/validators/date.validators.js';

export class FlightHoursQueryDto {
  @ApiProperty({ example: '2026-05-01', description: 'Range start (inclusive), YYYY-MM-DD' })
  @IsCalendarDate()
  from: string;

  @ApiProperty({ example: '2026-05-15', description: 'Range end (inclusive), YYYY-MM-DD' })
  @IsCalendarDate()
  @IsDateAfterOrEqual('from')
  to: string;
}

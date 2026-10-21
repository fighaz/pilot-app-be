import { IsCalendarDate, IsDateAfterOrEqual } from '../../common/validators/date.validators.js';

export class FlightHoursQueryDto {
  @IsCalendarDate()
  from: string;

  @IsCalendarDate()
  @IsDateAfterOrEqual('from')
  to: string;
}

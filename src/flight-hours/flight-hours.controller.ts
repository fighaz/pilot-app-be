import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service.js';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto.js';
import { SummaryQueryDto } from './dto/summary-query.dto.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get()
  getDailyHours(@Query() query: FlightHoursQueryDto) {
    return this.flightHoursService.getDailyHours(query.from, query.to);
  }

  @Get('summary')
  getSummary(@Query() query: SummaryQueryDto) {
    return this.flightHoursService.getSummary(query.range);
  }
}

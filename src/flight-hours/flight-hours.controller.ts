import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { FlightHoursService } from './flight-hours.service.js';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto.js';
import { SummaryQueryDto } from './dto/summary-query.dto.js';
import {
  DailyHoursResponseDto,
  SummaryResponseDto,
} from './dto/flight-hours-response.dto.js';

@ApiTags('flight-hours')
@ApiBearerAuth()
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get()
  @ApiOperation({
    summary: 'Daily flight hours in a date range',
    description: 'Inclusive range. Days without data are returned as 0 so no date is skipped.',
  })
  @ApiOkResponse({ type: DailyHoursResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getDailyHours(@Query() query: FlightHoursQueryDto) {
    return this.flightHoursService.getDailyHours(query.from, query.to);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Rolling sum series + limit cards for the Hours to Limit chart',
    description:
      'The rolling sum runs on the server. Returns 15 points (today-7 .. today+7, today centered), the limit line, chart Y max, and the four limit summary cards.',
  })
  @ApiOkResponse({ type: SummaryResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getSummary(@Query() query: SummaryQueryDto) {
    return this.flightHoursService.getSummary(query.range);
  }
}

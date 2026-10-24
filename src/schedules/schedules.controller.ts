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
import { SchedulesService } from './schedules.service.js';
import { SchedulesQueryDto } from './dto/schedules-query.dto.js';
import { SchedulesResponseDto } from './dto/schedules-response.dto.js';

@ApiTags('schedules')
@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({
    summary: 'Schedule entries for one month',
    description:
      'Returns the entries of the requested month plus the duty type legend (base colors).',
  })
  @ApiOkResponse({ type: SchedulesResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getMonthlySchedules(@Query() query: SchedulesQueryDto) {
    return this.schedulesService.getMonthlySchedules(query.year, query.month);
  }
}

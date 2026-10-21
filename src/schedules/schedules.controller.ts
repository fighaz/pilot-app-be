import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { SchedulesQueryDto } from './dto/schedules-query.dto.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getMonthlySchedules(@Query() query: SchedulesQueryDto) {
    return this.schedulesService.getMonthlySchedules(query.year, query.month);
  }
}

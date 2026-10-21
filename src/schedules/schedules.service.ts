import { Injectable } from '@nestjs/common';
import { DataSourceService } from '../database/data-source.service.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly dataSource: DataSourceService) {}

  getMonthlySchedules(year: number, month: number) {
    return {
      year,
      month,
      legend: this.dataSource.getLegend(),
      entries: this.dataSource.getSchedulesForMonth(year, month),
    };
  }
}

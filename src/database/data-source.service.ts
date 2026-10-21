import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  DocumentsData,
  FlightHoursData,
  ScheduleEntry,
  SchedulesData,
} from './data.types.js';

/**
 * Loads the provided mock JSON files once at startup and keeps them in
 * memory. No database is used, as stated in the brief.
 */
@Injectable()
export class DataSourceService implements OnModuleInit {
  private flightHoursData!: FlightHoursData;
  private documentsData!: DocumentsData;
  private schedulesData!: SchedulesData;

  onModuleInit() {
    this.flightHoursData = this.readJson<FlightHoursData>('mock-flight-hours.json');
    this.documentsData = this.readJson<DocumentsData>('mock-documents.json');
    this.schedulesData = this.readJson<SchedulesData>('mock-schedules.json');
  }

  private readJson<T>(file: string): T {
    const filePath = join(process.cwd(), file);
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  }

  getPilot() {
    return this.flightHoursData.pilot;
  }

  getLimits() {
    return this.flightHoursData.limits;
  }

  getChartBounds() {
    return this.flightHoursData.chartBounds;
  }

  getFlightHours() {
    return this.flightHoursData.flightHours;
  }

  getDocumentsData() {
    return this.documentsData;
  }

  getLegend() {
    return this.schedulesData.legend;
  }

  getSchedulesForMonth(year: number, month: number): ScheduleEntry[] {
    const prefix = `${year}-${`${month}`.padStart(2, '0')}`;
    return this.schedulesData.schedules.filter((entry) => entry.duty_date.startsWith(prefix));
  }
}

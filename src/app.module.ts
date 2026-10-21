import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module.js';
import { DataModule } from './database/data.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PilotModule } from './pilot/pilot.module.js';
import { FlightHoursModule } from './flight-hours/flight-hours.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';

@Module({
  imports: [
    ConfigModule,
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}

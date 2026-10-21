import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { DataSourceService } from '../database/data-source.service.js';

@Injectable()
export class PilotService {
  constructor(
    private readonly dataSource: DataSourceService,
    private readonly config: AppConfigService,
  ) {}

  getProfile() {
    const { name, totalFlightHours } = this.dataSource.getPilot();
    return {
      name,
      totalFlightHours,
      avatarUrl: this.config.pilotAvatarUrl,
    };
  }
}

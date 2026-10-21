import { Controller, Get } from '@nestjs/common';
import { PilotService } from './pilot.service.js';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  @Get('me')
  getProfile() {
    return this.pilotService.getProfile();
  }
}

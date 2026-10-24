import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { PilotProfileResponseDto } from './dto/pilot-profile-response.dto.js';
import { PilotService } from './pilot.service.js';

@ApiTags('pilot')
@ApiBearerAuth()
@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the pilot's profile" })
  @ApiOkResponse({ type: PilotProfileResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'Missing or invalid token' })
  getProfile() {
    return this.pilotService.getProfile();
  }
}

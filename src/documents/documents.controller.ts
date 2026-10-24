import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { DocumentsResponseDto } from './dto/documents-response.dto.js';
import { DocumentsService } from './documents.service.js';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: "Pilot's documents with expiry badge status",
    description: 'Badge status is computed server-side against the configured TODAY.',
  })
  @ApiOkResponse({ type: DocumentsResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  getDocuments() {
    return this.documentsService.getDocuments();
  }
}

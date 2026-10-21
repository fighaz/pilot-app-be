import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { DataSourceService } from '../database/data-source.service.js';
import { diffInDays } from '../common/utils/date.util.js';
import type { PilotDocument } from '../database/data.types.js';

export type DocumentStatus = 'safe' | 'soon' | 'expired';

export interface DocumentWithStatus extends PilotDocument {
  daysRemaining: number;
  status: DocumentStatus;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly dataSource: DataSourceService,
    private readonly config: AppConfigService,
  ) {}

  getDocuments(): { today: string; documents: DocumentWithStatus[] } {
    const { thresholds, documents } = this.dataSource.getDocumentsData();
    const today = this.config.today;

    return {
      today,
      documents: documents.map((document) => {
        const daysRemaining = diffInDays(today, document.expiryDate);
        const status: DocumentStatus =
          daysRemaining <= 0 ? 'expired' : daysRemaining <= thresholds.warningDays ? 'soon' : 'safe';
        return { ...document, daysRemaining, status };
      }),
    };
  }
}

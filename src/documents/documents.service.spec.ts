import { AppConfigService } from '../config/app-config.service.js';
import { DataSourceService } from '../database/data-source.service.js';
import { DocumentsService } from './documents.service.js';

function makeService(today = '2026-05-15') {
  const dataSource = {
    getDocumentsData: () => ({
      today: '2026-05-31',
      thresholds: { warningDays: 30 },
      documents: [
        { id: 'a', label: 'A', expiryDate: '2026-05-15' },
        { id: 'b', label: 'B', expiryDate: '2026-05-16' },
        { id: 'c', label: 'C', expiryDate: '2026-06-14' },
        { id: 'd', label: 'D', expiryDate: '2026-06-15' },
        { id: 'e', label: 'E', expiryDate: '2026-05-01' },
      ],
    }),
  } as unknown as DataSourceService;
  const config = { today } as unknown as AppConfigService;
  return new DocumentsService(dataSource, config);
}

describe('DocumentsService', () => {
  it('marks a document expiring today as expired', () => {
    const status = makeService().getDocuments().documents.find((d) => d.id === 'a');
    expect(status).toMatchObject({ daysRemaining: 0, status: 'expired' });
  });

  it('marks a document 1 day out as soon', () => {
    const status = makeService().getDocuments().documents.find((d) => d.id === 'b');
    expect(status).toMatchObject({ daysRemaining: 1, status: 'soon' });
  });

  it('marks a document at the warning threshold (30 days) as soon', () => {
    const status = makeService().getDocuments().documents.find((d) => d.id === 'c');
    expect(status).toMatchObject({ daysRemaining: 30, status: 'soon' });
  });

  it('marks a document one day past the warning threshold as safe', () => {
    const status = makeService().getDocuments().documents.find((d) => d.id === 'd');
    expect(status).toMatchObject({ daysRemaining: 31, status: 'safe' });
  });

  it('marks a document expired in the past as expired', () => {
    const status = makeService().getDocuments().documents.find((d) => d.id === 'e');
    expect(status).toMatchObject({ daysRemaining: -14, status: 'expired' });
  });

  it('uses the configured TODAY, not the today field inside the JSON', () => {
    expect(makeService().getDocuments().today).toBe('2026-05-15');
  });
});

import { DataSourceService } from '../database/data-source.service.js';
import { SchedulesService } from './schedules.service.js';

function makeService() {
  const dataSource = {
    getLegend: () => [{ code: 'DTY', label: 'On Duty', color: '#10B981' }],
    getSchedulesForMonth: (year: number, month: number) =>
      [
        { id: '1', duty_date: '2026-05-01', duty_type: 'DTY' },
        { id: '2', duty_date: '2026-05-31', duty_type: 'RLV' },
        { id: '3', duty_date: '2026-06-01', duty_type: 'DTY' },
      ].filter((entry) => entry.duty_date.startsWith(`${year}-${`${month}`.padStart(2, '0')}`)),
  } as unknown as DataSourceService;
  return new SchedulesService(dataSource);
}

describe('SchedulesService', () => {
  it('returns entries of the requested month plus the legend', () => {
    const result = makeService().getMonthlySchedules(2026, 5);

    expect(result.year).toBe(2026);
    expect(result.month).toBe(5);
    expect(result.legend).toEqual([{ code: 'DTY', label: 'On Duty', color: '#10B981' }]);
    expect(result.entries).toHaveLength(2);
    expect(result.entries.every((entry) => entry.duty_date.startsWith('2026-05'))).toBe(true);
  });

  it('returns an empty entries array for months without data', () => {
    const result = makeService().getMonthlySchedules(2026, 12);

    expect(result.entries).toEqual([]);
  });
});

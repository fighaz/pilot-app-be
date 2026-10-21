import { IsIn, IsOptional } from 'class-validator';
import type { SummaryRange } from '../../database/data.types.js';

export const SUMMARY_RANGES: SummaryRange[] = ['1w', '1m', '3m', '6m', '1y'];

export class SummaryQueryDto {
  @IsOptional()
  @IsIn(SUMMARY_RANGES)
  range: SummaryRange = '1w';
}

import { ApiProperty } from '@nestjs/swagger';

class DocumentItemDto {
  @ApiProperty({ example: 'doc_license' })
  id: string;

  @ApiProperty({ example: 'Indonesian License Exp. Date' })
  label: string;

  @ApiProperty({ example: '2026-05-29' })
  expiryDate: string;

  @ApiProperty({ example: 14, description: 'Days between TODAY and the expiry date' })
  daysRemaining: number;

  @ApiProperty({
    example: 'soon',
    enum: ['safe', 'soon', 'expired'],
    description:
      'Badge state: expired (≤ 0 days), soon (1..warningDays, default 30), safe (> warningDays)',
  })
  status: string;
}

export class DocumentsResponseDto {
  @ApiProperty({ example: '2026-05-15' })
  today: string;

  @ApiProperty({ type: [DocumentItemDto] })
  documents: DocumentItemDto[];
}

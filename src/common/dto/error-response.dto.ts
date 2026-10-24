import { ApiProperty } from '@nestjs/swagger';

/** Consistent error shape returned by the global exception filter. */
export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
    example: 'Invalid username or password',
    type: [String],
    required: false,
  })
  message: string | string[];

  @ApiProperty({ example: 'Unauthorized' })
  error: string;

  @ApiProperty({ example: '2026-05-15T09:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/auth/login' })
  path: string;
}

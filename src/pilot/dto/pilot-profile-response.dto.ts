import { ApiProperty } from '@nestjs/swagger';

export class PilotProfileResponseDto {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 1444.5 })
  totalFlightHours: number;

  @ApiProperty({ example: 'https://ui-avatars.com/api/?name=John+Doe' })
  avatarUrl: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwaWxvdF9qb2huZG9lIiwidXNlcm5hbWUiOiJqb2huZG9lIn0.x2f8...',
  })
  accessToken: string;
}

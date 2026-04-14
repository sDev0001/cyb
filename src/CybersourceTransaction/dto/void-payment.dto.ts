import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO minimal pentru corpul cererii de anulare
export class VoidPaymentDto {
  @ApiProperty({
    example: 'test_void_001',
    description: 'Referință unică pentru această operațiune de anulare.',
  })
  @IsNotEmpty()
  @IsString()
  clientReferenceCode: string;
}

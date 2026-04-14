import { ApiProperty } from '@nestjs/swagger';

class CardDto {
  @ApiProperty({ example: '001' })
  type: string;

  @ApiProperty({ example: '12' })
  expirationMonth: string;

  @ApiProperty({ example: '2026' })
  expirationYear: string;

  @ApiProperty({ example: '4000000000002503' })
  number: string;
}

export class CheckEnrollmentDto {
  @ApiProperty({ type: () => CardDto })
  paymentInformation: {
    card: CardDto;
  };
}

import { ApiProperty } from '@nestjs/swagger';

export class CheckPayerAuthDto {
  @ApiProperty()
  clientReferenceInformation: { code: string };

  @ApiProperty()
  paymentInformation: {
    card: {
      number: string;
      expirationMonth: string;
      expirationYear: string;
    };
  };
}

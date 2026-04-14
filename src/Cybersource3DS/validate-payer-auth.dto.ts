import { ApiProperty } from '@nestjs/swagger';

export class ValidatePayerAuthDto {
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

  @ApiProperty()
  authenticationTransactionId: string;

  @ApiProperty()
  authenticationResponse: string; // value returned from ACS / 3DS challenge
}

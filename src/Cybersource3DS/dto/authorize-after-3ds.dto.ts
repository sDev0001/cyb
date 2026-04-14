import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ClientReferenceDto {
  @ApiProperty({ example: 'TC50171_3' })
  @IsString()
  code: string;
}

class ProcessingInformationDto {
  @ApiProperty({
    example: 'internet',
    description: 'Commerce Indicator (internet / eci / moto)',
  })
  @IsString()
  commerceIndicator: string;
}

class CardDto {
  @ApiProperty({ example: '001', description: '001=Visa, 002=Mastercard, 003=Amex' })
  type?: string;

  @ApiProperty({ example: '4111111111111111' })
  number: string;

  @ApiProperty({ example: '12' })
  expirationMonth: string;

  @ApiProperty({ example: '2031' })
  expirationYear: string;
}

class PaymentInformationDto {
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}

class AmountDetailsDto {
  @ApiProperty({ example: '102.21' })
  totalAmount: string;

  @ApiProperty({ example: 'USD' })
  currency: string;
}

class BillToDto {
  firstName: string;
  lastName: string;
  address1: string;
  locality: string;
  administrativeArea: string;
  postalCode: string;
  country: string;
  email: string;
  phoneNumber: string;
}

class OrderInformationDto {
  @ValidateNested()
  @Type(() => AmountDetailsDto)
  amountDetails: AmountDetailsDto;

  @ValidateNested()
  @Type(() => BillToDto)
  billTo: BillToDto;
}

class ConsumerAuthenticationInformationDto {
  @ApiProperty({ example: 'AAABBBCCC...' })
  cavv: string;

  @ApiProperty({ example: 'XID123456' })
  xid: string;

  @ApiProperty({ example: '05', description: 'ECI from validate-authentication-results' })
  eci?: string;

  @ApiProperty({ example: '2.2.0', description: 'Specification version from validate' })
  specificationVersion?: string;

  @ApiProperty({ example: '01', description: 'Directory server transaction ID' })
  directoryServerTransactionId?: string;

  @ApiProperty({ example: 'fOyjABgCLcxKEkO7ElB0', description: 'Authentication transaction ID from check-payer-auth-enrollment' })
  authenticationTransactionId?: string;

  @ApiProperty({ example: 'Y', description: 'paresStatus from validate' })
  paresStatus?: string;
}

export class AuthorizeAfter3dsDto {
  @ValidateNested()
  @Type(() => ClientReferenceDto)
  clientReferenceInformation: ClientReferenceDto;

  @ValidateNested()
  @Type(() => ProcessingInformationDto)
  processingInformation: ProcessingInformationDto;

  @ValidateNested()
  @Type(() => PaymentInformationDto)
  paymentInformation: PaymentInformationDto;

  @ValidateNested()
  @Type(() => OrderInformationDto)
  orderInformation: OrderInformationDto;

  @ValidateNested()
  @Type(() => ConsumerAuthenticationInformationDto)
  consumerAuthenticationInformation: ConsumerAuthenticationInformationDto;
}

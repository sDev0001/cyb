import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AmountDetailsDto {
  @ApiProperty({ example: '10.99' })
  @IsString()
  @IsNotEmpty()
  totalAmount: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;
}

class BillToDto {
  @ApiProperty({ example: '1 Market St' })
  @IsString()
  address1: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  administrativeArea: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'san francisco' })
  @IsString()
  locality: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'test@cybs.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '94105' })
  @IsString()
  postalCode: string;
}

class OrderInformationDto {
  @ValidateNested()
  @Type(() => AmountDetailsDto)
  amountDetails: AmountDetailsDto;

  @ValidateNested()
  @Type(() => BillToDto)
  billTo: BillToDto;
}

class CardDto {
  @ApiProperty({ example: '001', description: '001=VISA, 002=MASTERCARD' })
  @IsString()
  type: string;

  @ApiProperty({ example: '4000000000002503' })
  @IsString()
  number: string;

  @ApiProperty({ example: '12' })
  @IsString()
  expirationMonth: string;

  @ApiProperty({ example: '2026' })
  @IsString()
  expirationYear: string;
}

class PaymentInformationDto {
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}

class BuyerInformationDto {
  @ApiProperty({ example: '1245789632' })
  @IsString()
  @IsOptional()
  mobilePhone?: string;
}

class DeviceInformationDto {
  @ApiProperty({ example: '139.130.4.5' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ example: 'text/html,application/xhtml+xml' })
  @IsString()
  @IsOptional()
  httpAcceptContent?: string;

  @ApiProperty({ example: 'en-US' })
  @IsString()
  @IsOptional()
  httpBrowserLanguage?: string;

  @ApiProperty({ example: 'N' })
  @IsString()
  @IsOptional()
  httpBrowserJavaEnabled?: string;

  @ApiProperty({ example: 'Y' })
  @IsString()
  @IsOptional()
  httpBrowserJavaScriptEnabled?: string;

  @ApiProperty({ example: '24' })
  @IsString()
  @IsOptional()
  httpBrowserColorDepth?: string;

  @ApiProperty({ example: '1080' })
  @IsString()
  @IsOptional()
  httpBrowserScreenHeight?: string;

  @ApiProperty({ example: '1920' })
  @IsString()
  @IsOptional()
  httpBrowserScreenWidth?: string;

  @ApiProperty({ example: '300' })
  @IsString()
  @IsOptional()
  httpBrowserTimeDifference?: string;

  @ApiProperty({ example: 'Mozilla/5.0 Chrome/120' })
  @IsString()
  @IsOptional()
  userAgentBrowserValue?: string;
}

class ConsumerAuthenticationInformationDto {
  @ApiProperty({ example: 'BROWSER' })
  @IsString()
  deviceChannel: string;

  @ApiProperty({ example: 'eCommerce' })
  @IsString()
  transactionMode: string;

  @ApiProperty({ example: 'https://polka.requestcatcher.com' })
  @IsString()
  returnUrl: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class CheckPayerAuthEnrollmentDto {
  @ValidateNested()
  @Type(() => OrderInformationDto)
  orderInformation: OrderInformationDto;

  @ValidateNested()
  @Type(() => PaymentInformationDto)
  paymentInformation: PaymentInformationDto;

  @ValidateNested()
  @Type(() => BuyerInformationDto)
  @IsOptional()
  buyerInformation?: BuyerInformationDto;

  @ValidateNested()
  @Type(() => DeviceInformationDto)
  deviceInformation: DeviceInformationDto;

  @ValidateNested()
  @Type(() => ConsumerAuthenticationInformationDto)
  consumerAuthenticationInformation: ConsumerAuthenticationInformationDto;
}

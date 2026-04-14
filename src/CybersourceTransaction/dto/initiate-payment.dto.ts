import {
  IsNotEmpty,
  IsString,
  Length,
  IsNumberString,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger'; // Adaugat

// --- SUB-DTO-URI (Toate cu @ApiProperty) ---

export class ClientReferenceDto {
  @ApiProperty({ example: 'TC50171_3' }) // Exemplu pentru primul API
  @IsNotEmpty()
  @IsString()
  code: string = 'TC50171_3';
}

export class CardDetailsDto {
  @ApiProperty({ example: '4111111111111111' }) // Exemplul cardului normal
  @IsNotEmpty()
  @Length(16, 16, { message: 'Card number must be 16 digits.' })
  @IsNumberString()
  number: string = '4111111111111111';

  @ApiProperty({ example: '12' })
  @IsNotEmpty()
  @Length(2, 2)
  @IsNumberString()
  expirationMonth: string = '12';

  @ApiProperty({ example: '2031' })
  @IsNotEmpty()
  @Length(4, 4)
  @IsNumberString()
  expirationYear: string = '2031';
}

export class PaymentInformationDto {
  @ValidateNested()
  @Type(() => CardDetailsDto)
  card: CardDetailsDto;
}

export class AmountDetailsDto {
  @ApiProperty({ example: '102.21' }) // Exemplul sumei
  @IsNotEmpty()
  @IsNumberString()
  totalAmount: string = '102.21';

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  currency: string = 'USD';
}

export class BillToDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string = 'John';

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string = 'Doe';

  @ApiProperty({ example: '1 Market St' })
  @IsNotEmpty()
  @IsString()
  address1: string = '1 Market St';

  @ApiProperty({ example: 'san francisco' })
  @IsNotEmpty()
  @IsString()
  locality: string = 'san francisco';

  @ApiProperty({ example: 'CA' })
  @IsNotEmpty()
  @IsString()
  administrativeArea: string = 'CA';

  @ApiProperty({ example: '94105' })
  @IsNotEmpty()
  @IsString()
  postalCode: string = '94105';

  @ApiProperty({ example: 'US' })
  @IsNotEmpty()
  @IsString()
  country: string = 'US';

  @ApiProperty({ example: 'test@cybs.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string = 'test@cybs.com';

  @ApiProperty({ example: '4158880000' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string = '4158880000';
}

export class OrderInformationDto {
  @ValidateNested()
  @Type(() => AmountDetailsDto)
  amountDetails: AmountDetailsDto;

  @ValidateNested()
  @Type(() => BillToDto)
  billTo: BillToDto;
}

// --- DTO PRINCIPAL (InitiatePaymentDto) ---

export class InitiatePaymentDto {
  @ValidateNested()
  @Type(() => ClientReferenceDto)
  clientReferenceInformation: ClientReferenceDto;

  @ValidateNested()
  @Type(() => PaymentInformationDto)
  paymentInformation: PaymentInformationDto;

  @ValidateNested()
  @Type(() => OrderInformationDto)
  orderInformation: OrderInformationDto;
}

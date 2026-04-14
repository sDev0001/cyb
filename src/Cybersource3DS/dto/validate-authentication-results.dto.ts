import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CardDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

class PaymentInformationDto {
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;
}

class ConsumerAuthenticationInformationDto {
  @IsString()
  @IsNotEmpty()
  authenticationTransactionId: string;
}

class ClientReferenceInformationDto {
  @ApiProperty({ example: 'txn_123456', description: 'Same code used across all 3DS steps' })
  @IsString()
  @IsOptional()
  code?: string;
}

export class ValidateAuthenticationResultsDto {
  @ValidateNested()
  @Type(() => PaymentInformationDto)
  paymentInformation: PaymentInformationDto;

  @ValidateNested()
  @Type(() => ConsumerAuthenticationInformationDto)
  consumerAuthenticationInformation: ConsumerAuthenticationInformationDto;

  @ValidateNested()
  @Type(() => ClientReferenceInformationDto)
  @IsOptional()
  clientReferenceInformation?: ClientReferenceInformationDto;
}

// src/cybersource-transaction/dto/create-pay-by-link.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Structuri Interne ---

class PartnerDto {
  @ApiProperty({ example: '3435' })
  @IsNotEmpty()
  @IsString()
  developerId: string;

  @ApiProperty({ example: '83745' })
  @IsNotEmpty()
  @IsString()
  solutionId: string;
}

class ClientReferenceInformationDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => PartnerDto)
  partner: PartnerDto;
}

class ProcessingInformationDto {
  @ApiProperty({ example: 'PURCHASE' })
  @IsNotEmpty()
  @IsString()
  linkType: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  requestPhone: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  requestShipping: boolean;
}

class PurchaseInformationDto {
  @ApiProperty({ example: '23412' })
  @IsNotEmpty()
  @IsString()
  purchaseNumber: string;
}

class AmountDetailsDto {
  @ApiProperty({ example: '12.05' })
  @IsNotEmpty()
  @IsNumberString()
  totalAmount: string;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumberString()
  minAmount: string;
}

class LineItemDto {
  @ApiProperty({ example: "First line item's name" })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ example: '10' })
  @IsNotEmpty()
  @IsNumberString()
  quantity: string;

  @ApiProperty({ example: '12.05' })
  @IsNotEmpty()
  @IsNumberString()
  unitPrice: string;

  @ApiProperty({ example: "First line item's description" })
  @IsNotEmpty()
  @IsString()
  productDescription: string;
}

class OrderInformationDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AmountDetailsDto)
  amountDetails: AmountDetailsDto;

  @ApiProperty({ type: [LineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];
}

// --- DTO de Nivel Superior (Rădăcină) ---

export class CreatePayByLinkDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ClientReferenceInformationDto)
  clientReferenceInformation: ClientReferenceInformationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ProcessingInformationDto)
  processingInformation: ProcessingInformationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PurchaseInformationDto)
  purchaseInformation: PurchaseInformationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OrderInformationDto)
  orderInformation: OrderInformationDto;
}

import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ClientReferenceDto,
  CardDetailsDto,
  BillToDto,
} from './initiate-payment.dto';

export class PaymentInformationZeroDto {
  @ValidateNested()
  @Type(() => CardDetailsDto)
  card: CardDetailsDto;
}

export class OrderInformationZeroDto {
  @ValidateNested()
  @Type(() => BillToDto)
  billTo: BillToDto;
}

export class ZeroDollarAuthDto {
  @ValidateNested()
  @Type(() => ClientReferenceDto)
  clientReferenceInformation: ClientReferenceDto;

  @ValidateNested()
  @Type(() => PaymentInformationZeroDto)
  paymentInformation: PaymentInformationZeroDto;

  @ValidateNested()
  @Type(() => OrderInformationZeroDto)
  orderInformation: OrderInformationZeroDto;
}

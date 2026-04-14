export class CardDto {
  type: string; // ex: "001"
  number: string; // ex: "4000000000002503"
  expirationMonth: string; // ex: "12"
  expirationYear: string; // ex: "2026"
}

export class PaymentInformationDto {
  card: CardDto;
}

export class AuthenticationSetupDto {
  paymentInformation: PaymentInformationDto;
}

export class ConsumerAuthenticationInformationDto {
  accessToken: string;
  deviceDataCollectionUrl: string;
  referenceId: string;
  token: string;
}

export class ClientReferenceInformationDto {
  code: string;
}

export class AuthenticationSetupResponseDto {
  clientReferenceInformation: ClientReferenceInformationDto;
  consumerAuthenticationInformation: ConsumerAuthenticationInformationDto;
  id: string;
  status: string;
  submitTimeUtc: string;
}

import { Injectable } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { Configuration } from '../../configCyb/Configuration';

@Injectable()
export class CybersourceClientService {
  readonly configObject: any;
  readonly apiClient: cybersourceRestApi.ApiClient;

  constructor() {
    this.configObject = Configuration();
    if (this.configObject?.logConfiguration) {
      this.configObject.logConfiguration.logDirectory = null;
    }
    this.apiClient = new cybersourceRestApi.ApiClient();
  }

  get paymentsApi(): cybersourceRestApi.PaymentsApi {
    return new cybersourceRestApi.PaymentsApi(this.configObject, this.apiClient);
  }

  get voidApi(): cybersourceRestApi.VoidApi {
    return new cybersourceRestApi.VoidApi(this.configObject, this.apiClient);
  }

  get captureApi(): cybersourceRestApi.CaptureApi {
    return new cybersourceRestApi.CaptureApi(this.configObject, this.apiClient);
  }

  get transactionDetailsApi(): cybersourceRestApi.TransactionDetailsApi {
    return new cybersourceRestApi.TransactionDetailsApi(
      this.configObject,
      this.apiClient,
    );
  }

  get payerAuthApi(): cybersourceRestApi.PayerAuthenticationApi {
    return new cybersourceRestApi.PayerAuthenticationApi(
      this.configObject,
      this.apiClient,
    );
  }

  get paymentLinksApi(): cybersourceRestApi.PaymentLinksApi {
    return new cybersourceRestApi.PaymentLinksApi(
      this.configObject,
      this.apiClient,
    );
  }
}

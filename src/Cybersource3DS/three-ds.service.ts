import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { CheckEnrollmentDto } from './dto/check-enrollment.dto';
import { ValidateAuthenticationResultsDto } from './dto/validate-authentication-results.dto';
import { AuthorizeAfter3dsDto } from './dto/authorize-after-3ds.dto';
const ConfigurationFunction =
  require('../../configCyb/Configuration').Configuration;

@Injectable()
export class ThreeDsService {
  private configObject: any;
  private apiClient: cybersourceRestApi.ApiClient;
  private payerAuthApi: cybersourceRestApi.PayerAuthenticationApi;
  private captureApi: cybersourceRestApi.CaptureApi;

  constructor() {
    // 3DS setup existent
    this.configObject = new ConfigurationFunction();
    this.apiClient = new cybersourceRestApi.ApiClient();
    this.payerAuthApi = new cybersourceRestApi.PayerAuthenticationApi(
      this.configObject,
      this.apiClient,
    );
    this.captureApi = new cybersourceRestApi.CaptureApi(
      this.configObject,
      this.apiClient,
    );
  }

  // ================= EXISTING 3DS CHECK ENROLLMENT =================
  async checkEnrollment(dto: CheckEnrollmentDto): Promise<any> {
    const requestObj = new cybersourceRestApi.PayerAuthSetupRequest();

    const clientReferenceInformation =
      new cybersourceRestApi.Riskv1authenticationsetupsClientReferenceInformation();
    clientReferenceInformation.code = 'cybs_test';

    const clientReferenceInformationPartner =
      new cybersourceRestApi.Riskv1decisionsClientReferenceInformationPartner();
    clientReferenceInformationPartner.developerId = '7891234';
    clientReferenceInformationPartner.solutionId = '89012345';
    clientReferenceInformation.partner = clientReferenceInformationPartner;

    requestObj.clientReferenceInformation = clientReferenceInformation;

    const paymentInformation =
      new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformation();
    const paymentInformationCard =
      new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformationCard();

    paymentInformationCard.type = dto.paymentInformation.card.type;
    paymentInformationCard.number = dto.paymentInformation.card.number;
    paymentInformationCard.expirationMonth =
      dto.paymentInformation.card.expirationMonth;
    paymentInformationCard.expirationYear =
      dto.paymentInformation.card.expirationYear;

    paymentInformation.card = paymentInformationCard;
    requestObj.paymentInformation = paymentInformation;

    try {
      const { data, response } = await new Promise<any>((resolve, reject) => {
        this.payerAuthApi.payerAuthSetup(
          requestObj,
          (error, data, response) => {
            if (error) return reject(error);
            resolve({ data, response });
          },
        );
      });

      return {
        success: true,
        id: data.id,
        status: data.status,
        message: 'Cardul este inregistrat pentru 3DS.',
        data,
      };
    } catch (error) {
      console.error('3DS Risk Authentication Error:', error);
      throw new InternalServerErrorException(
        'Eroare 3DS Setup Completion: ' +
          (error.stack || error.message || JSON.stringify(error)),
      );
    }
  }

  // ================= EXISTING: RISK AUTHENTICATION =================
  async riskAuthentication(body: any): Promise<any> {
    try {
      const apiKey = process.env.CYBERSOURCE_API_KEY || '';
      const apiSecret = process.env.CYBERSOURCE_API_SECRET || '';
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

      const response = await axios.post(
        'https://apitest.cybersource.com/risk/v1/authentications',
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('Risk Authentication Error:', error.response || error);
      throw new InternalServerErrorException(
        'Eroare Risk Authentication: ' +
          (error.response?.data || error.message || JSON.stringify(error)),
      );
    }
  }

  // ================= NEW: CHECK PAYER AUTH ENROLLMENT =================
  // ================= CHECK PAYER AUTH ENROLLMENT (CHALLENGE FLOW) =================
  async checkPayerAuthEnrollment(body: any): Promise<any> {
    try {
      const requestObj =
        new cybersourceRestApi.CheckPayerAuthEnrollmentRequest();

      // Client reference
      const clientRef =
        new cybersourceRestApi.Riskv1authenticationsetupsClientReferenceInformation();
      clientRef.code = 'cybs_test';
      requestObj.clientReferenceInformation = clientRef;

      // Order Information
      requestObj.orderInformation = body.orderInformation;

      // Payment Information
      requestObj.paymentInformation = body.paymentInformation;

      // Buyer Information
      requestObj.buyerInformation = body.buyerInformation;

      // Device Information (CRITIC PENTRU CHALLENGE)
      requestObj.deviceInformation = body.deviceInformation;

      // Consumer Authentication Information
      const consumerAuthInfo =
        new cybersourceRestApi.Riskv1decisionsConsumerAuthenticationInformation();

      consumerAuthInfo.deviceChannel =
        body.consumerAuthenticationInformation.deviceChannel;

      consumerAuthInfo.transactionMode =
        body.consumerAuthenticationInformation.transactionMode;

      consumerAuthInfo.returnUrl =
        body.consumerAuthenticationInformation.returnUrl;

      if (body.consumerAuthenticationInformation.referenceId) {
        consumerAuthInfo.referenceId =
          body.consumerAuthenticationInformation.referenceId;
      }

      requestObj.consumerAuthenticationInformation = consumerAuthInfo;

      return new Promise((resolve, reject) => {
        this.payerAuthApi.checkPayerAuthEnrollment(
          requestObj,
          (error, data, response) => {
            if (error) return reject(error);
            resolve({
              success: true,
              status: data.status,
              data,
            });
          },
        );
      });
    } catch (error: any) {
      console.error('Check Payer Auth Enrollment Error:', error);
      throw new InternalServerErrorException(
        'Eroare Check Payer Auth Enrollment: ' +
          (error.response?.data || error.message || JSON.stringify(error)),
      );
    }
  }

  async validateAuthenticationResults(
    dto: ValidateAuthenticationResultsDto,
  ): Promise<any> {
    try {
      const requestObj = new cybersourceRestApi.ValidateRequest();

      // Client Reference (use same code from the transaction chain if provided)
      const clientReferenceInformation =
        new cybersourceRestApi.Riskv1authenticationsetupsClientReferenceInformation();
      clientReferenceInformation.code = dto.clientReferenceInformation?.code || 'pavalidatecheck';

      const partner =
        new cybersourceRestApi.Riskv1decisionsClientReferenceInformationPartner();
      partner.developerId = '7891234';
      partner.solutionId = '89012345';

      clientReferenceInformation.partner = partner;
      requestObj.clientReferenceInformation = clientReferenceInformation;

      // Payment Information
      const paymentInformation =
        new cybersourceRestApi.Riskv1authenticationresultsPaymentInformation();
      const card =
        new cybersourceRestApi.Riskv1authenticationresultsPaymentInformationCard();
      card.type = dto.paymentInformation.card.type;
      paymentInformation.card = card;
      requestObj.paymentInformation = paymentInformation;

      // Consumer Authentication Information
      const consumerAuth =
        new cybersourceRestApi.Riskv1authenticationresultsConsumerAuthenticationInformation();
      consumerAuth.authenticationTransactionId =
        dto.consumerAuthenticationInformation.authenticationTransactionId;
      requestObj.consumerAuthenticationInformation = consumerAuth;

      // Call CyberSource
      return new Promise((resolve, reject) => {
        this.payerAuthApi.validateAuthenticationResults(
          requestObj,
          (error, data, response) => {
            if (error) return reject(error);
            resolve({
              success: true,
              status: response?.status,
              data,
            });
          },
        );
      });
    } catch (error: any) {
      console.error('Validate Authentication Results Error:', error);
      throw new InternalServerErrorException(
        'Eroare Validate Authentication Results: ' +
          (error.message || JSON.stringify(error)),
      );
    }
  }

  async processFullCheckout(
    cardData: { type: string; number: string; expirationMonth: string; expirationYear: string },
    orderData: { totalAmount: string; currency: string; firstName: string; lastName: string; email: string; address1: string; locality: string; administrativeArea: string; postalCode: string; country: string },
    returnUrl: string,
  ): Promise<{ accessToken: string; authenticationTransactionId: string; stepUpUrl: string; clientReferenceCode: string }> {
    const clientReferenceCode = 'txn_' + Date.now();

    // Single createPayment call with actionList: CONSUMER_AUTHENTICATION
    // This combines setup + enrollment into one API call
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    // Client Reference
    const clientRef = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientRef.code = clientReferenceCode;
    requestObj.clientReferenceInformation = clientRef;

    // Processing Information with actionList
    const processingInfo = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInfo.actionList = ['CONSUMER_AUTHENTICATION'];
    processingInfo.capture = false;
    requestObj.processingInformation = processingInfo;

    // Payment Information
    const paymentInfo = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    card.type = cardData.type;
    card.number = cardData.number;
    card.expirationMonth = cardData.expirationMonth;
    card.expirationYear = cardData.expirationYear;
    paymentInfo.card = card;
    requestObj.paymentInformation = paymentInfo;

    // Order Information
    const orderInfo = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    const amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    amountDetails.totalAmount = orderData.totalAmount;
    amountDetails.currency = orderData.currency;
    orderInfo.amountDetails = amountDetails;

    const billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    billTo.firstName = orderData.firstName;
    billTo.lastName = orderData.lastName;
    billTo.address1 = orderData.address1;
    billTo.locality = orderData.locality;
    billTo.administrativeArea = orderData.administrativeArea;
    billTo.postalCode = orderData.postalCode;
    billTo.country = orderData.country;
    billTo.email = orderData.email;
    orderInfo.billTo = billTo;
    requestObj.orderInformation = orderInfo;

    // Buyer Information
    requestObj.buyerInformation = { mobilePhone: '1245789632' };

    // Device Information
    requestObj.deviceInformation = {
      ipAddress: '139.130.4.5',
      httpAcceptContent: 'text/html,application/xhtml+xml',
      httpBrowserLanguage: 'en-US',
      httpBrowserJavaEnabled: 'N',
      httpBrowserJavaScriptEnabled: 'Y',
      httpBrowserColorDepth: '24',
      httpBrowserScreenHeight: '1080',
      httpBrowserScreenWidth: '1920',
      httpBrowserTimeDifference: '300',
      userAgentBrowserValue: 'Mozilla/5.0 Chrome/120',
    };

    // Consumer Authentication Information
    const consumerAuth = new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
    consumerAuth.deviceChannel = 'BROWSER';
    consumerAuth.transactionMode = 'eCommerce';
    consumerAuth.returnUrl = returnUrl;
    requestObj.consumerAuthenticationInformation = consumerAuth;

    const paymentsApi = new cybersourceRestApi.PaymentsApi(
      this.configObject,
      this.apiClient,
    );

    const result = await new Promise<any>((resolve, reject) => {
      paymentsApi.createPayment(requestObj, (error, data, response) => {
        if (error) return reject(error);
        resolve({ success: true, status: data.status, id: data.id, data });
      });
    });

    const authInfo = result.data?.consumerAuthenticationInformation;

    return {
      accessToken: authInfo?.accessToken,
      authenticationTransactionId: authInfo?.authenticationTransactionId,
      stepUpUrl: authInfo?.stepUpUrl || 'https://centinelapistag.cardinalcommerce.com/V2/Cruise/StepUp',
      clientReferenceCode,
    };
  }

  async authorizeAfter3ds(dto: AuthorizeAfter3dsDto): Promise<any> {
    try {
      const requestObj = new cybersourceRestApi.CreatePaymentRequest();

      // Client Reference
      requestObj.clientReferenceInformation = dto.clientReferenceInformation;

      // Processing Information: VALIDATE + authorize + capture in one call
      const processingInfo =
        new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
      processingInfo.actionList = ['VALIDATE_CONSUMER_AUTHENTICATION'];
      processingInfo.capture = true;
      processingInfo.commerceIndicator =
        dto.processingInformation.commerceIndicator;
      requestObj.processingInformation = processingInfo;

      // Payment Information
      requestObj.paymentInformation = {
        card: dto.paymentInformation.card,
      };

      // Order Information
      requestObj.orderInformation = dto.orderInformation;

      // Consumer Authentication Information (3DS RESULT)
      const consumerAuth =
        new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
      consumerAuth.cavv = dto.consumerAuthenticationInformation.cavv;
      consumerAuth.xid = dto.consumerAuthenticationInformation.xid;
      if (dto.consumerAuthenticationInformation.eci) {
        consumerAuth.eciRaw = dto.consumerAuthenticationInformation.eci;
      }
      if (dto.consumerAuthenticationInformation.specificationVersion) {
        consumerAuth.paSpecificationVersion = dto.consumerAuthenticationInformation.specificationVersion;
      }
      if (dto.consumerAuthenticationInformation.directoryServerTransactionId) {
        consumerAuth.directoryServerTransactionId = dto.consumerAuthenticationInformation.directoryServerTransactionId;
      }
      if (dto.consumerAuthenticationInformation.authenticationTransactionId) {
        consumerAuth.authenticationTransactionId = dto.consumerAuthenticationInformation.authenticationTransactionId;
      }
      if (dto.consumerAuthenticationInformation.paresStatus) {
        consumerAuth.paresStatus = dto.consumerAuthenticationInformation.paresStatus;
      }
      requestObj.consumerAuthenticationInformation = consumerAuth;

      const paymentsApi = new cybersourceRestApi.PaymentsApi(
        this.configObject,
        this.apiClient,
      );

      return new Promise((resolve, reject) => {
        paymentsApi.createPayment(requestObj, (error, data, response) => {
          if (error) return reject(error);
          resolve({
            success: true,
            status: data.status,
            id: data.id,
            data,
          });
        });
      });
    } catch (error: any) {
      console.error('Authorize After 3DS Error:', error);
      throw new InternalServerErrorException(
        error.message || JSON.stringify(error),
      );
    }
  }

  async capturePayment(
    transactionId: string,
    totalAmount: string,
    currency: string,
    clientRefCode?: string,
  ): Promise<any> {
    try {
      const requestObj = new cybersourceRestApi.CapturePaymentRequest();

      // Client Reference
      const clientRef = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
      clientRef.code = clientRefCode || 'capture_' + Date.now();
      requestObj.clientReferenceInformation = clientRef;

      // Order Information (amount to capture)
      const orderInfo = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
      const amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
      amountDetails.totalAmount = totalAmount;
      amountDetails.currency = currency;
      orderInfo.amountDetails = amountDetails;
      requestObj.orderInformation = orderInfo;

      return new Promise((resolve, reject) => {
        this.captureApi.capturePayment(
          requestObj,
          transactionId,
          (error, data, response) => {
            if (error) return reject(error);
            resolve({
              success: true,
              status: data.status,
              id: data.id,
              data,
            });
          },
        );
      });
    } catch (error: any) {
      console.error('Capture Payment Error:', error);
      throw new InternalServerErrorException(
        error.message || JSON.stringify(error),
      );
    }
  }
}

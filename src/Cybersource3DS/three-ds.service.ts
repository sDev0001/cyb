import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { CybersourceClientService } from '../shared/cybersource-client.service';
import { partnerIds } from '../../configCyb/Configuration';
import { CheckEnrollmentDto } from './dto/check-enrollment.dto';
import { CheckPayerAuthEnrollmentDto } from './dto/check-payer-auth-enrollment.dto';
import { ValidateAuthenticationResultsDto } from './dto/validate-authentication-results.dto';
import { AuthorizeAfter3dsDto } from './dto/authorize-after-3ds.dto';

@Injectable()
export class ThreeDsService {
  constructor(private readonly cyb: CybersourceClientService) {}

  async checkEnrollment(dto: CheckEnrollmentDto): Promise<any> {
    const requestObj = new cybersourceRestApi.PayerAuthSetupRequest();

    const clientReferenceInformation =
      new cybersourceRestApi.Riskv1authenticationsetupsClientReferenceInformation();
    clientReferenceInformation.code = 'cybs_test';

    const partner =
      new cybersourceRestApi.Riskv1decisionsClientReferenceInformationPartner();
    partner.developerId = partnerIds.developerId;
    partner.solutionId = partnerIds.solutionId;
    clientReferenceInformation.partner = partner;
    requestObj.clientReferenceInformation = clientReferenceInformation;

    const paymentInformation =
      new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformation();
    const card =
      new cybersourceRestApi.Riskv1authenticationsetupsPaymentInformationCard();
    card.type = dto.paymentInformation.card.type;
    card.number = dto.paymentInformation.card.number;
    card.expirationMonth = dto.paymentInformation.card.expirationMonth;
    card.expirationYear = dto.paymentInformation.card.expirationYear;
    paymentInformation.card = card;
    requestObj.paymentInformation = paymentInformation;

    try {
      const data = await new Promise<any>((resolve, reject) => {
        this.cyb.payerAuthApi.payerAuthSetup(requestObj, (error, data) => {
          if (error) return reject(error);
          resolve(data);
        });
      });

      return {
        success: true,
        id: data.id,
        status: data.status,
        message: 'Cardul este inregistrat pentru 3DS.',
        data,
      };
    } catch (error: any) {
      console.error('3DS Setup Error:', error);
      throw new InternalServerErrorException(
        'Eroare 3DS Setup Completion: ' +
          (error.stack || error.message || JSON.stringify(error)),
      );
    }
  }

  async checkPayerAuthEnrollment(body: CheckPayerAuthEnrollmentDto): Promise<any> {
    try {
      const requestObj =
        new cybersourceRestApi.CheckPayerAuthEnrollmentRequest();

      const clientRef =
        new cybersourceRestApi.Riskv1authenticationsetupsClientReferenceInformation();
      clientRef.code = 'cybs_test';
      requestObj.clientReferenceInformation = clientRef;

      requestObj.orderInformation = body.orderInformation;
      requestObj.paymentInformation = body.paymentInformation;
      requestObj.buyerInformation = body.buyerInformation;
      requestObj.deviceInformation = body.deviceInformation;

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
        this.cyb.payerAuthApi.checkPayerAuthEnrollment(
          requestObj,
          (error, data) => {
            if (error) return reject(error);
            resolve({ success: true, status: data.status, data });
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

      const clientReferenceInformation =
        new cybersourceRestApi.Riskv1authenticationsetupsClientReferenceInformation();
      clientReferenceInformation.code =
        dto.clientReferenceInformation?.code || 'pavalidatecheck';

      const partner =
        new cybersourceRestApi.Riskv1decisionsClientReferenceInformationPartner();
      partner.developerId = partnerIds.developerId;
      partner.solutionId = partnerIds.solutionId;
      clientReferenceInformation.partner = partner;
      requestObj.clientReferenceInformation = clientReferenceInformation;

      const paymentInformation =
        new cybersourceRestApi.Riskv1authenticationresultsPaymentInformation();
      const card =
        new cybersourceRestApi.Riskv1authenticationresultsPaymentInformationCard();
      card.type = dto.paymentInformation.card.type;
      paymentInformation.card = card;
      requestObj.paymentInformation = paymentInformation;

      const consumerAuth =
        new cybersourceRestApi.Riskv1authenticationresultsConsumerAuthenticationInformation();
      consumerAuth.authenticationTransactionId =
        dto.consumerAuthenticationInformation.authenticationTransactionId;
      requestObj.consumerAuthenticationInformation = consumerAuth;

      return new Promise((resolve, reject) => {
        this.cyb.payerAuthApi.validateAuthenticationResults(
          requestObj,
          (error, data, response) => {
            if (error) return reject(error);
            resolve({ success: true, status: response?.status, data });
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
    cardData: {
      type: string;
      number: string;
      expirationMonth: string;
      expirationYear: string;
    },
    orderData: {
      totalAmount: string;
      currency: string;
      firstName: string;
      lastName: string;
      email: string;
      address1: string;
      locality: string;
      administrativeArea: string;
      postalCode: string;
      country: string;
    },
    returnUrl: string,
  ): Promise<{
    accessToken: string;
    authenticationTransactionId: string;
    stepUpUrl: string;
    clientReferenceCode: string;
  }> {
    const clientReferenceCode = 'txn_' + Date.now();

    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    const clientRef =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientRef.code = clientReferenceCode;
    requestObj.clientReferenceInformation = clientRef;

    const processingInfo =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInfo.actionList = ['CONSUMER_AUTHENTICATION'];
    processingInfo.capture = false;
    requestObj.processingInformation = processingInfo;

    const paymentInfo =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    card.type = cardData.type;
    card.number = cardData.number;
    card.expirationMonth = cardData.expirationMonth;
    card.expirationYear = cardData.expirationYear;
    paymentInfo.card = card;
    requestObj.paymentInformation = paymentInfo;

    const orderInfo = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    const amountDetails =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
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

    requestObj.buyerInformation = { mobilePhone: '1245789632' };

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

    const consumerAuth =
      new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
    consumerAuth.deviceChannel = 'BROWSER';
    consumerAuth.transactionMode = 'eCommerce';
    consumerAuth.returnUrl = returnUrl;
    requestObj.consumerAuthenticationInformation = consumerAuth;

    const result = await new Promise<any>((resolve, reject) => {
      this.cyb.paymentsApi.createPayment(requestObj, (error, data) => {
        if (error) return reject(error);
        resolve({ success: true, status: data.status, id: data.id, data });
      });
    });

    const authInfo = result.data?.consumerAuthenticationInformation;

    return {
      accessToken: authInfo?.accessToken,
      authenticationTransactionId: authInfo?.authenticationTransactionId,
      stepUpUrl:
        authInfo?.stepUpUrl ||
        'https://centinelapistag.cardinalcommerce.com/V2/Cruise/StepUp',
      clientReferenceCode,
    };
  }

  async authorizeAfter3ds(dto: AuthorizeAfter3dsDto): Promise<any> {
    try {
      const requestObj = new cybersourceRestApi.CreatePaymentRequest();
      requestObj.clientReferenceInformation = dto.clientReferenceInformation;

      const processingInfo =
        new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
      if (dto.consumerAuthenticationInformation.authenticationTransactionId) {
        processingInfo.actionList = ['VALIDATE_CONSUMER_AUTHENTICATION'];
      }
      processingInfo.capture = true;
      processingInfo.commerceIndicator =
        dto.processingInformation.commerceIndicator;
      requestObj.processingInformation = processingInfo;

      requestObj.paymentInformation = { card: dto.paymentInformation.card };
      requestObj.orderInformation = dto.orderInformation;

      const consumerAuth =
        new cybersourceRestApi.Ptsv2paymentsConsumerAuthenticationInformation();
      const ca = dto.consumerAuthenticationInformation;
      if (ca.cavv) consumerAuth.cavv = ca.cavv;
      if (ca.xid) consumerAuth.xid = ca.xid;
      if (ca.ucafAuthenticationData)
        consumerAuth.ucafAuthenticationData = ca.ucafAuthenticationData;
      if (ca.ucafCollectionIndicator)
        consumerAuth.ucafCollectionIndicator = ca.ucafCollectionIndicator;
      if (ca.eci) consumerAuth.eciRaw = ca.eci;
      if (ca.specificationVersion)
        consumerAuth.paSpecificationVersion = ca.specificationVersion;
      if (ca.directoryServerTransactionId)
        consumerAuth.directoryServerTransactionId =
          ca.directoryServerTransactionId;
      if (ca.authenticationTransactionId)
        consumerAuth.authenticationTransactionId =
          ca.authenticationTransactionId;
      if (ca.paresStatus) consumerAuth.paresStatus = ca.paresStatus;
      requestObj.consumerAuthenticationInformation = consumerAuth;

      return new Promise((resolve, reject) => {
        this.cyb.paymentsApi.createPayment(requestObj, (error, data) => {
          if (error) {
            console.error(
              '[authorize-after-3ds] CYBERSOURCE ERROR body:',
              error?.response?.text || error?.response?.body || error,
            );
            return reject(error);
          }
          resolve({ success: true, status: data.status, id: data.id, data });
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

      const clientRef =
        new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
      clientRef.code = clientRefCode || 'capture_' + Date.now();
      requestObj.clientReferenceInformation = clientRef;

      const orderInfo = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
      const amountDetails =
        new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
      amountDetails.totalAmount = totalAmount;
      amountDetails.currency = currency;
      orderInfo.amountDetails = amountDetails;
      requestObj.orderInformation = orderInfo;

      return new Promise((resolve, reject) => {
        this.cyb.captureApi.capturePayment(
          requestObj,
          transactionId,
          (error, data) => {
            if (error) return reject(error);
            resolve({ success: true, status: data.status, id: data.id, data });
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

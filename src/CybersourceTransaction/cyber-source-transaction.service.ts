import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ZeroDollarAuthDto } from './dto/zero-dollar-auth.dto';
import { VoidPaymentDto } from './dto/void-payment.dto';

const ConfigurationFunction =
  require('../../configCyb/Configuration').Configuration;

@Injectable()
export class CyberSourceTransactionService {
  private configObject: any;
  private apiClient: cybersourceRestApi.ApiClient;
  private paymentsApi: cybersourceRestApi.PaymentsApi;
  private voidApi: cybersourceRestApi.VoidApi;
  private transactionDetailsApi: cybersourceRestApi.TransactionDetailsApi;

  constructor() {
    this.configObject = ConfigurationFunction();
    this.apiClient = new cybersourceRestApi.ApiClient();
    this.paymentsApi = new cybersourceRestApi.PaymentsApi(
      this.configObject,
      this.apiClient,
    );

    this.voidApi = new cybersourceRestApi.VoidApi(
      this.configObject,
      this.apiClient,
    );

    this.transactionDetailsApi = new cybersourceRestApi.TransactionDetailsApi(
      this.configObject,
      this.apiClient,
    );
  }

  async simpleAuthorization(dto: InitiatePaymentDto): Promise<any> {
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    // 1. Client Reference Information (folosind structura imbricata)
    const clientRefInfo =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientRefInfo.code = dto.clientReferenceInformation.code;
    requestObj.clientReferenceInformation = clientRefInfo;

    // 2. Processing Information
    const processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.capture = false;
    requestObj.processingInformation = processingInformation;

    // 3. Payment Information
    const paymentInformation =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const paymentInformationCard =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    paymentInformationCard.number = dto.paymentInformation.card.number;
    paymentInformationCard.expirationMonth =
      dto.paymentInformation.card.expirationMonth;
    paymentInformationCard.expirationYear =
      dto.paymentInformation.card.expirationYear;
    paymentInformation.card = paymentInformationCard;
    requestObj.paymentInformation = paymentInformation;

    // 4. Order Information
    const orderInformation =
      new cybersourceRestApi.Ptsv2paymentsOrderInformation();

    const orderInformationAmountDetails =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    orderInformationAmountDetails.totalAmount =
      dto.orderInformation.amountDetails.totalAmount;
    orderInformationAmountDetails.currency =
      dto.orderInformation.amountDetails.currency;
    orderInformation.amountDetails = orderInformationAmountDetails;

    // 5. Billing Information
    const orderInformationBillTo =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    orderInformationBillTo.firstName = dto.orderInformation.billTo.firstName;
    orderInformationBillTo.lastName = dto.orderInformation.billTo.lastName;
    orderInformationBillTo.address1 = dto.orderInformation.billTo.address1;
    orderInformationBillTo.locality = dto.orderInformation.billTo.locality;
    orderInformationBillTo.administrativeArea =
      dto.orderInformation.billTo.administrativeArea;
    orderInformationBillTo.postalCode = dto.orderInformation.billTo.postalCode;
    orderInformationBillTo.country = dto.orderInformation.billTo.country;
    orderInformationBillTo.email = dto.orderInformation.billTo.email;
    orderInformationBillTo.phoneNumber =
      dto.orderInformation.billTo.phoneNumber;
    orderInformation.billTo = orderInformationBillTo;
    requestObj.orderInformation = orderInformation;

    try {
      const data: any = await new Promise((resolve, reject) => {
        this.paymentsApi.createPayment(
          requestObj,
          (error: any, data: any, response: any) => {
            if (error) {
              console.error('CyberSource API Error:', JSON.stringify(error));
              return reject(error);
            }
            if (response.status === 201) {
              return resolve(data);
            }
            return resolve(data);
          },
        );
      });

      // Logica de verificare a statusului
      if (data && data['status'] === 'AUTHORIZED') {
        return {
          success: true,
          status: data['status'],
          id: data['id'],
          avs: data['processorInformation']['avs']['code'],
        };
      } else {
        return {
          success: false,
          status: data['status'],
          errorReason: data['errorInformation']
            ? data['errorInformation']['reason']
            : 'Unknown',
          details: data,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API: ' + (error.stack || error.message),
      );
    }
  }

  async zeroDollarAuthorization(dto: ZeroDollarAuthDto): Promise<any> {
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    // 1. Client Reference Information
    const clientRefInfo =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientRefInfo.code = dto.clientReferenceInformation.code;
    requestObj.clientReferenceInformation = clientRefInfo;

    // 2. Processing Information (Autorizare simpla, FaRa Captura)
    const processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.capture = false;
    requestObj.processingInformation = processingInformation;

    // 3. Payment Information
    const paymentInformation =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const paymentInformationCard =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    paymentInformationCard.number = dto.paymentInformation.card.number;
    paymentInformationCard.expirationMonth =
      dto.paymentInformation.card.expirationMonth;
    paymentInformationCard.expirationYear =
      dto.paymentInformation.card.expirationYear;
    // Nu includem securityCode (CVV) pentru a folosi cardul de test 5555...4444 care nu necesita CVV pentru 0$ auth.
    paymentInformation.card = paymentInformationCard;
    requestObj.paymentInformation = paymentInformation;

    // 4. Order Information
    const orderInformation =
      new cybersourceRestApi.Ptsv2paymentsOrderInformation();

    // DETALII SUMa: Hardcodat la 0 USD
    const orderInformationAmountDetails =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    orderInformationAmountDetails.totalAmount = '0.00';
    orderInformationAmountDetails.currency = 'USD';
    orderInformation.amountDetails = orderInformationAmountDetails;

    // 5. Billing Information
    const orderInformationBillTo =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    orderInformationBillTo.firstName = dto.orderInformation.billTo.firstName;
    orderInformationBillTo.lastName = dto.orderInformation.billTo.lastName;
    orderInformationBillTo.address1 = dto.orderInformation.billTo.address1;
    orderInformationBillTo.locality = dto.orderInformation.billTo.locality;
    orderInformationBillTo.administrativeArea =
      dto.orderInformation.billTo.administrativeArea;
    orderInformationBillTo.postalCode = dto.orderInformation.billTo.postalCode;
    orderInformationBillTo.country = dto.orderInformation.billTo.country;
    orderInformationBillTo.email = dto.orderInformation.billTo.email;
    orderInformationBillTo.phoneNumber =
      dto.orderInformation.billTo.phoneNumber;
    orderInformation.billTo = orderInformationBillTo;
    requestObj.orderInformation = orderInformation;

    try {
      const data: any = await new Promise((resolve, reject) => {
        this.paymentsApi.createPayment(
          requestObj,
          (error: any, data: any, response: any) => {
            if (error) {
              console.error(
                'CyberSource API Error (Zero Dollar Auth):',
                JSON.stringify(error),
              );
              return reject(error);
            }
            return resolve(data);
          },
        );
      });

      // Logica de verificare a statusului (pentru 0$ auth, ar trebui sa fie AUTHORIZED)
      if (data && data['status'] === 'AUTHORIZED') {
        return {
          success: true,
          message: 'Zero Dollar Authorization Successful.',
          status: data['status'],
          id: data['id'],
        };
      } else {
        return {
          success: false,
          message: 'Zero Dollar Authorization Failed.',
          status: data['status'],
          reason: data['errorInformation']
            ? data['errorInformation']['reason']
            : 'Unknown',
          details: data,
        };
      }
    } catch (error) {
      const errorMessage =
        (error as Error).stack ||
        (error as Error).message ||
        'Eroare necunoscuta';
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru 0$ Auth: ' + errorMessage,
      );
    }
  }

  // NOUA METODa: AUTHORIZATION WITH CAPTURE (SALE)
  async saleAuthorization(dto: InitiatePaymentDto): Promise<any> {
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    // 1. Client Reference Information (Identic)
    const clientRefInfo =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientRefInfo.code = dto.clientReferenceInformation.code;
    requestObj.clientReferenceInformation = clientRefInfo;

    // 2. PROCESSING INFORMATION: SET CAPTURE TO TRUE
    const processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.capture = true; // <-- Diferența cheie
    requestObj.processingInformation = processingInformation;

    // 3. Payment Information (Identic)
    const paymentInformation =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const paymentInformationCard =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    paymentInformationCard.number = dto.paymentInformation.card.number;
    paymentInformationCard.expirationMonth =
      dto.paymentInformation.card.expirationMonth;
    paymentInformationCard.expirationYear =
      dto.paymentInformation.card.expirationYear;
    // Puteți adauga securityCode daca este necesar pentru cardul de test 4111...
    // paymentInformationCard.securityCode = dto.paymentInformation.card.securityCode;
    paymentInformation.card = paymentInformationCard;
    requestObj.paymentInformation = paymentInformation;

    // 4. Order Information (Identic)
    const orderInformation =
      new cybersourceRestApi.Ptsv2paymentsOrderInformation();

    // Detalii Suma
    const orderInformationAmountDetails =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
    orderInformationAmountDetails.totalAmount =
      dto.orderInformation.amountDetails.totalAmount;
    orderInformationAmountDetails.currency =
      dto.orderInformation.amountDetails.currency;
    orderInformation.amountDetails = orderInformationAmountDetails;

    // Billing Information
    const orderInformationBillTo =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    orderInformationBillTo.firstName = dto.orderInformation.billTo.firstName;
    orderInformationBillTo.lastName = dto.orderInformation.billTo.lastName;
    orderInformationBillTo.address1 = dto.orderInformation.billTo.address1;
    orderInformationBillTo.locality = dto.orderInformation.billTo.locality;
    orderInformationBillTo.administrativeArea =
      dto.orderInformation.billTo.administrativeArea;
    orderInformationBillTo.postalCode = dto.orderInformation.billTo.postalCode;
    orderInformationBillTo.country = dto.orderInformation.billTo.country;
    orderInformationBillTo.email = dto.orderInformation.billTo.email;
    orderInformationBillTo.phoneNumber =
      dto.orderInformation.billTo.phoneNumber;
    orderInformation.billTo = orderInformationBillTo;
    requestObj.orderInformation = orderInformation;

    try {
      const data: any = await new Promise((resolve, reject) => {
        this.paymentsApi.createPayment(
          requestObj,
          (error: any, data: any, response: any) => {
            if (error) {
              console.error(
                'CyberSource API Error (Capture Sale):',
                JSON.stringify(error),
              );
              return reject(error);
            }
            return resolve(data);
          },
        );
      });

      // Pentru Sale, statusul de succes este adesea APPROVED sau AUTHORIZED
      if (
        data &&
        (data['status'] === 'APPROVED' || data['status'] === 'AUTHORIZED')
      ) {
        return {
          success: true,
          status: data['status'],
          id: data['id'],
          avs: data['processorInformation']['avs']['code'],
        };
      } else {
        return {
          success: false,
          status: data['status'],
          errorReason: data['errorInformation']
            ? data['errorInformation']['reason']
            : 'Unknown',
          details: data,
        };
      }
    } catch (error) {
      const errorMessage =
        (error as Error).stack ||
        (error as Error).message ||
        'Eroare necunoscuta';
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru Sale: ' + errorMessage,
      );
    }
  }

  // NOUA METODa: VOID PAYMENT
  async voidPayment(
    transactionId: string,
    clientRefCode: string, // <--- Acum acceptă doar șirul de caractere
  ): Promise<any> {
    const requestObj = new cybersourceRestApi.VoidPaymentRequest();

    // 1. Client Reference Information
    const clientReferenceInformation =
      new cybersourceRestApi.Ptsv2paymentsidreversalsClientReferenceInformation();
    clientReferenceInformation.code = clientRefCode; // <--- Folosim direct valoarea din URL
    requestObj.clientReferenceInformation = clientReferenceInformation;

    // 2. Apel API
    try {
      const data: any = await new Promise((resolve, reject) => {
        this.voidApi.voidPayment(
          requestObj,
          transactionId,
          (error: any, data: any) => {
            // ... (Logica de eroare/rezolvare rămâne aceeași)
            if (error) {
              console.error(
                'CyberSource API Error (Void Payment):',
                JSON.stringify(error),
              );
              return reject(error);
            }
            return resolve(data);
          },
        );
      });

      // Logica de verificare a statusului (pentru Void, căutăm REVERSED)
      if (data && data['status'] === 'REVERSED') {
        return {
          success: true,
          message: 'Tranzacție anulată cu succes.',
          status: data['status'],
          id: data['id'],
        };
      } else {
        return {
          success: false,
          message: 'Anularea a eșuat.',
          status: data['status'],
          reason: data['errorInformation']
            ? data['errorInformation']['reason']
            : 'Unknown',
          details: data,
        };
      }
    } catch (error) {
      const errorMessage =
        (error as Error).stack ||
        (error as Error).message ||
        'Eroare necunoscută';
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru Void: ' + errorMessage,
      );
    }
  }

  // NOUA METODĂ: RETRIEVE TRANSACTION DETAILS
  async retrieveTransaction(transactionId: string): Promise<any> {
    try {
      const data: any = await new Promise((resolve, reject) => {
        this.transactionDetailsApi.getTransaction(
          transactionId,
          (error: any, data: any, response: any) => {
            if (error) {
              console.error(
                'CyberSource API Error (Retrieve Transaction):',
                JSON.stringify(error),
              );
              return reject(error);
            }
            // CyberSource returnează data direct în cazul de succes (200 OK)
            return resolve(data);
          },
        );
      });

      // Răspunsul CyberSource conține toate câmpurile cerute
      return {
        success: true,
        message: 'Detalii tranzacție preluate cu succes.',
        details: data, // Returnăm tot obiectul de date
      };
    } catch (error) {
      const errorMessage =
        (error as Error).stack ||
        (error as Error).message ||
        'Eroare necunoscută';
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru Retrieve Transaction: ' +
          errorMessage,
      );
    }
  }
}

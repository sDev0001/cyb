import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { CybersourceClientService } from '../shared/cybersource-client.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ZeroDollarAuthDto } from './dto/zero-dollar-auth.dto';

@Injectable()
export class CyberSourceTransactionService {
  constructor(private readonly cyb: CybersourceClientService) {}

  private buildBaseRequest(
    dto: InitiatePaymentDto | ZeroDollarAuthDto,
    opts: { capture: boolean; zeroAmount?: boolean },
  ): cybersourceRestApi.CreatePaymentRequest {
    const requestObj = new cybersourceRestApi.CreatePaymentRequest();

    const clientRefInfo =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    clientRefInfo.code = dto.clientReferenceInformation.code;
    requestObj.clientReferenceInformation = clientRefInfo;

    const processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    processingInformation.capture = opts.capture;
    requestObj.processingInformation = processingInformation;

    const paymentInformation =
      new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
    const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
    card.number = dto.paymentInformation.card.number;
    card.expirationMonth = dto.paymentInformation.card.expirationMonth;
    card.expirationYear = dto.paymentInformation.card.expirationYear;
    paymentInformation.card = card;
    requestObj.paymentInformation = paymentInformation;

    const orderInformation =
      new cybersourceRestApi.Ptsv2paymentsOrderInformation();
    const amountDetails =
      new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();

    if (opts.zeroAmount) {
      amountDetails.totalAmount = '0.00';
      amountDetails.currency = 'USD';
    } else {
      const paymentDto = dto as InitiatePaymentDto;
      amountDetails.totalAmount =
        paymentDto.orderInformation.amountDetails.totalAmount;
      amountDetails.currency =
        paymentDto.orderInformation.amountDetails.currency;
    }
    orderInformation.amountDetails = amountDetails;

    const billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
    Object.assign(billTo, dto.orderInformation.billTo);
    orderInformation.billTo = billTo;
    requestObj.orderInformation = orderInformation;

    return requestObj;
  }

  private callCreatePayment(
    requestObj: cybersourceRestApi.CreatePaymentRequest,
    context: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cyb.paymentsApi.createPayment(requestObj, (error, data) => {
        if (error) {
          console.error(`CyberSource API Error (${context}):`, JSON.stringify(error));
          return reject(error);
        }
        return resolve(data);
      });
    });
  }

  async simpleAuthorization(dto: InitiatePaymentDto): Promise<any> {
    const requestObj = this.buildBaseRequest(dto, { capture: false });
    try {
      const data = await this.callCreatePayment(requestObj, 'simpleAuth');
      if (data?.status === 'AUTHORIZED') {
        return {
          success: true,
          status: data.status,
          id: data.id,
          avs: data.processorInformation?.avs?.code,
        };
      }
      return {
        success: false,
        status: data?.status,
        errorReason: data?.errorInformation?.reason || 'Unknown',
        details: data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API: ' +
          ((error as Error).stack || (error as Error).message),
      );
    }
  }

  async zeroDollarAuthorization(dto: ZeroDollarAuthDto): Promise<any> {
    const requestObj = this.buildBaseRequest(dto, {
      capture: false,
      zeroAmount: true,
    });
    try {
      const data = await this.callCreatePayment(requestObj, 'zeroAuth');
      if (data?.status === 'AUTHORIZED') {
        return {
          success: true,
          message: 'Zero Dollar Authorization Successful.',
          status: data.status,
          id: data.id,
        };
      }
      return {
        success: false,
        message: 'Zero Dollar Authorization Failed.',
        status: data?.status,
        reason: data?.errorInformation?.reason || 'Unknown',
        details: data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru 0$ Auth: ' +
          ((error as Error).stack || (error as Error).message),
      );
    }
  }

  async saleAuthorization(dto: InitiatePaymentDto): Promise<any> {
    const requestObj = this.buildBaseRequest(dto, { capture: true });
    try {
      const data = await this.callCreatePayment(requestObj, 'saleAuth');
      if (data?.status === 'APPROVED' || data?.status === 'AUTHORIZED') {
        return {
          success: true,
          status: data.status,
          id: data.id,
          avs: data.processorInformation?.avs?.code,
        };
      }
      return {
        success: false,
        status: data?.status,
        errorReason: data?.errorInformation?.reason || 'Unknown',
        details: data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru Sale: ' +
          ((error as Error).stack || (error as Error).message),
      );
    }
  }

  async voidPayment(transactionId: string, clientRefCode: string): Promise<any> {
    const requestObj = new cybersourceRestApi.VoidPaymentRequest();
    const clientReferenceInformation =
      new cybersourceRestApi.Ptsv2paymentsidreversalsClientReferenceInformation();
    clientReferenceInformation.code = clientRefCode;
    requestObj.clientReferenceInformation = clientReferenceInformation;

    try {
      const data: any = await new Promise((resolve, reject) => {
        this.cyb.voidApi.voidPayment(requestObj, transactionId, (error, data) => {
          if (error) {
            console.error('CyberSource API Error (Void Payment):', JSON.stringify(error));
            return reject(error);
          }
          return resolve(data);
        });
      });

      if (data?.status === 'REVERSED') {
        return {
          success: true,
          message: 'Tranzacție anulată cu succes.',
          status: data.status,
          id: data.id,
        };
      }
      return {
        success: false,
        message: 'Anularea a eșuat.',
        status: data?.status,
        reason: data?.errorInformation?.reason || 'Unknown',
        details: data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru Void: ' +
          ((error as Error).stack || (error as Error).message),
      );
    }
  }

  async retrieveTransaction(transactionId: string): Promise<any> {
    try {
      const data = await new Promise((resolve, reject) => {
        this.cyb.transactionDetailsApi.getTransaction(
          transactionId,
          (error, data) => {
            if (error) {
              console.error(
                'CyberSource API Error (Retrieve Transaction):',
                JSON.stringify(error),
              );
              return reject(error);
            }
            return resolve(data);
          },
        );
      });

      return {
        success: true,
        message: 'Detalii tranzacție preluate cu succes.',
        details: data,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Eroare la apelul CyberSource API pentru Retrieve Transaction: ' +
          ((error as Error).stack || (error as Error).message),
      );
    }
  }
}

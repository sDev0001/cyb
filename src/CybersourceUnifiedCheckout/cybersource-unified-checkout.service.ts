import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { CybersourceClientService } from '../shared/cybersource-client.service';
import { CreatePayByLinkDto } from './dto/generate-capture-context.dto';

@Injectable()
export class CybersourceUnifiedCheckoutService {
  constructor(private readonly cyb: CybersourceClientService) {}

  async generatePayByLink(dto: CreatePayByLinkDto): Promise<any> {
    const requestObj = new cybersourceRestApi.CreatePaymentLinkRequest();

    const clientRefInfo =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    const partner =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformationPartner();
    partner.developerId = dto.clientReferenceInformation.partner.developerId;
    partner.solutionId = dto.clientReferenceInformation.partner.solutionId;
    clientRefInfo.partner = partner;
    requestObj.clientReferenceInformation = clientRefInfo;

    const processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
    (processingInformation as any).linkType =
      dto.processingInformation.linkType;
    (processingInformation as any).requestPhone =
      dto.processingInformation.requestPhone;
    (processingInformation as any).requestShipping =
      dto.processingInformation.requestShipping;
    processingInformation.commerceIndicator = 'internet';
    requestObj.processingInformation = processingInformation;

    requestObj.purchaseInformation = {
      purchaseNumber: dto.purchaseInformation.purchaseNumber,
    } as cybersourceRestApi.Ptsv2paymentsPurchaseInformation;

    requestObj.orderInformation = {
      amountDetails: {
        totalAmount: dto.orderInformation.amountDetails.totalAmount,
        currency: dto.orderInformation.amountDetails.currency,
        minAmount: dto.orderInformation.amountDetails.minAmount,
      },
      lineItems: dto.orderInformation.lineItems.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        productDescription: item.productDescription,
      })),
    } as cybersourceRestApi.Ptsv2paymentsOrderInformation;

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    requestObj.expirationDateTime = expiryDate.toISOString();

    try {
      const data: any = await new Promise((resolve, reject) => {
        this.cyb.paymentLinksApi.createPaymentLink(requestObj, (error, data) => {
          if (error) {
            console.error(
              'CyberSource API Error (PayByLink):',
              JSON.stringify(error.response, null, 2),
            );
            return reject(error);
          }
          return resolve(data);
        });
      });

      return {
        success: true,
        message: 'Link Pay By Link generat cu succes.',
        id: data.id,
        checkoutUrl: data.purchaseInformation?.paymentLink,
        linkExpiresAt: data.expirationDateTime || 'N/A',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        (error as Error).stack ||
          (error as Error).message ||
          'Eroare necunoscută la apelul CyberSource API',
      );
    }
  }
}

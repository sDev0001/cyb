// src/cybersource-unified-checkout/cybersource-unified-checkout.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cybersourceRestApi from 'cybersource-rest-client';
import { CreatePayByLinkDto } from './dto/generate-capture-context.dto';

// Asumăm că acest fișier exportă o funcție numită Configuration
const ConfigurationFunction =
  require('../../configCyb/Configuration').Configuration;

@Injectable()
export class CybersourceUnifiedCheckoutService {
  private configObject: any;
  private apiClient: cybersourceRestApi.ApiClient;
  private paymentLinksApi: cybersourceRestApi.PaymentLinksApi;

  constructor() {
    this.configObject = ConfigurationFunction();

    if (this.configObject && this.configObject.logConfiguration) {
      this.configObject.logConfiguration.logDirectory = null;
    }

    this.apiClient = new cybersourceRestApi.ApiClient();

    this.paymentLinksApi = new cybersourceRestApi.PaymentLinksApi(
      this.configObject,
      this.apiClient,
    );
  }

  /**
   * Generează un Link de Plată (Pay By Link)
   */
  async generatePayByLink(dto: CreatePayByLinkDto): Promise<any> {
    const requestObj = new cybersourceRestApi.CreatePaymentLinkRequest();

    // 1. clientReferenceInformation
    const clientRefInfo =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
    const partner =
      new cybersourceRestApi.Ptsv2paymentsClientReferenceInformationPartner();

    partner.developerId = dto.clientReferenceInformation.partner.developerId;
    partner.solutionId = dto.clientReferenceInformation.partner.solutionId;
    clientRefInfo.partner = partner;
    requestObj.clientReferenceInformation = clientRefInfo;

    // 2. processingInformation
    const processingInformation =
      new cybersourceRestApi.Ptsv2paymentsProcessingInformation();

    // CORECȚIA FINALĂ linkType: Setăm proprietățile Pay By Link în obiectul processingInformation
    (processingInformation as any).linkType =
      dto.processingInformation.linkType;
    (processingInformation as any).requestPhone =
      dto.processingInformation.requestPhone;
    (processingInformation as any).requestShipping =
      dto.processingInformation.requestShipping;

    processingInformation.commerceIndicator = 'internet';
    requestObj.processingInformation = processingInformation;

    // 3. purchaseInformation
    // SOLUȚIA DE EVITARE A CONSTRUCTORULUI: Object Literal Assignment
    requestObj.purchaseInformation = {
      purchaseNumber: dto.purchaseInformation.purchaseNumber,
    } as cybersourceRestApi.Ptsv2paymentsPurchaseInformation;

    // 4. orderInformation
    // SOLUȚIA DE EVITARE A CONSTRUCTORULUI: Object Literal Assignment
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

    // 5. expirationDateTime (OBLIGATORIU)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    requestObj.expirationDateTime = expiryDate.toISOString();

    // 6. Rularea cererii
    try {
      const data: any = await new Promise((resolve, reject) => {
        this.paymentLinksApi.createPaymentLink(
          requestObj,
          (error: any, data: any, response: any) => {
            if (error) {
              console.error(
                'CyberSource API Error (PayByLink):',
                JSON.stringify(error.response, null, 2),
              );
              return reject(error);
            }
            return resolve(data);
          },
        );
      });

      // 💡 EXTRAGEM URL-ul și ID-ul din răspunsul complex CyberSource
      const linkId = data.id;
      // URL-ul de checkout se găsește sub purchaseInformation.paymentLink
      const checkoutUrl = data.purchaseInformation?.paymentLink;
      const linkExpiresAt = data.expirationDateTime;

      // Returnăm răspunsul simplificat dorit
      return {
        success: true,
        message: 'Link Pay By Link generat cu succes.',
        id: linkId,
        checkoutUrl: checkoutUrl,
        linkExpiresAt: linkExpiresAt || 'N/A',
      };
    } catch (error) {
      const errorMessage =
        (error as Error).stack ||
        (error as Error).message ||
        'Eroare necunoscută la apelul CyberSource API';
      throw new InternalServerErrorException(errorMessage);
    }
  }
}

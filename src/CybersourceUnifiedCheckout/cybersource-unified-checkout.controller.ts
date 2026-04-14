// src/cybersource-unified-checkout/cybersource-unified-checkout.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CybersourceUnifiedCheckoutService } from './cybersource-unified-checkout.service';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreatePayByLinkDto } from './dto/generate-capture-context.dto';

@ApiTags('CyberSource Payment Links (Pay by Link)')
@Controller('payment-links')
export class CybersourceUnifiedCheckoutController {
  constructor(
    private readonly unifiedCheckoutService: CybersourceUnifiedCheckoutService,
  ) {}

  @Post('generate-link')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: CreatePayByLinkDto,
    examples: {
      example: {
        summary: 'Exemplu Generare Link de Plată (Payload Detaliat)',
        value: {
          clientReferenceInformation: {
            partner: {
              developerId: '3435',
              solutionId: '83745',
            },
          },
          processingInformation: {
            linkType: 'PURCHASE',
            requestPhone: false,
            requestShipping: false,
          },
          purchaseInformation: {
            purchaseNumber: '23412',
          },
          orderInformation: {
            amountDetails: {
              totalAmount: '12.05',
              currency: 'USD',
              minAmount: '1',
            },
            lineItems: [
              {
                productName: "First line item's name",
                quantity: '10',
                unitPrice: '12.05',
                productDescription: "First line item's description",
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Link de plată CyberSource generat cu succes.',
    content: {
      'application/json': {
        schema: {
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            id: { type: 'string' },
            checkoutUrl: { type: 'string', format: 'url' },
            linkExpiresAt: { type: 'string', format: 'date-time' },
          },
        },
        example: {
          success: true,
          message: 'Link Pay By Link generat cu succes.',
          id: '23412112',
          checkoutUrl:
            'https://ebc2test.cybersource.com/ebc2/payByLink/pay/...',
          linkExpiresAt: '2025-12-05T14:42:44Z',
        },
      },
    },
  })
  async generatePayByLinkContext(@Body() body: CreatePayByLinkDto) {
    // Returnăm direct obiectul simplificat de la serviciu
    return await this.unifiedCheckoutService.generatePayByLink(body);
  }
}

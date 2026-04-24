import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiExcludeEndpoint,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CheckEnrollmentDto } from './dto/check-enrollment.dto';
import { CheckPayerAuthEnrollmentDto } from './dto/check-payer-auth-enrollment.dto';
import { ValidateAuthenticationResultsDto } from './dto/validate-authentication-results.dto';
import { AuthorizeAfter3dsDto } from './dto/authorize-after-3ds.dto';
import { ThreeDsService } from './three-ds.service';
import { CHECKOUT_PAGE_HTML } from './checkout-page.template';

@ApiTags('3DS Transactions')
@Controller('3ds')
export class ThreeDsController {
  constructor(private readonly threeDsService: ThreeDsService) {}

  @Post('setup-payer-auth')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description:
      '3DS Check Enrollment. IMPORTANT: type = "001" pentru VISA, type = "002" pentru MASTERCARD.',
    examples: {
      visa: {
        summary: 'VISA (type = 001)',
        value: {
          paymentInformation: {
            card: {
              type: '001',
              expirationMonth: '12',
              expirationYear: '2026',
              number: '4000000000002503',
            },
          },
        },
      },
      mastercard: {
        summary: 'MASTERCARD (type = 002)',
        value: {
          paymentInformation: {
            card: {
              type: '002',
              expirationMonth: '12',
              expirationYear: '2030',
              number: '5120342233150747',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Raspuns 3DS Setup Completion' })
  async checkEnrollment(@Body() body: CheckEnrollmentDto) {
    return this.threeDsService.checkEnrollment(body);
  }

  @Post('check-payer-auth-enrollment')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: CheckPayerAuthEnrollmentDto,
    description:
      'Check Payer Auth Enrollment (3DS Challenge). IMPORTANT: type = "001" pentru VISA, type = "002" pentru MASTERCARD. Token access link: https://acs-sooty.vercel.app',
    examples: {
      visa: {
        summary: 'VISA (type = 001)',
        value: {
          orderInformation: {
            amountDetails: { currency: 'USD', totalAmount: '10.99' },
            billTo: {
              address1: '1 Market St',
              administrativeArea: 'CA',
              country: 'US',
              locality: 'san francisco',
              firstName: 'John',
              lastName: 'Doe',
              email: 'test@cybs.com',
              postalCode: '94105',
            },
          },
          paymentInformation: {
            card: {
              type: '001',
              number: '4000000000002503',
              expirationMonth: '12',
              expirationYear: '2026',
            },
          },
          buyerInformation: { mobilePhone: '1245789632' },
          deviceInformation: {
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
          },
          consumerAuthenticationInformation: {
            deviceChannel: 'BROWSER',
            transactionMode: 'eCommerce',
            returnUrl: 'https://polka.requestcatcher.com',
          },
        },
      },
      mastercard: {
        summary: 'MASTERCARD (type = 002)',
        value: {
          orderInformation: {
            amountDetails: { currency: 'USD', totalAmount: '10.99' },
            billTo: {
              address1: '1 Market St',
              administrativeArea: 'CA',
              country: 'US',
              locality: 'san francisco',
              firstName: 'John',
              lastName: 'Doe',
              email: 'test@cybs.com',
              postalCode: '94105',
            },
          },
          paymentInformation: {
            card: {
              type: '002',
              number: '5120342233150747',
              expirationMonth: '12',
              expirationYear: '2030',
            },
          },
          buyerInformation: { mobilePhone: '1245789632' },
          deviceInformation: {
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
          },
          consumerAuthenticationInformation: {
            deviceChannel: 'BROWSER',
            transactionMode: 'eCommerce',
            returnUrl: 'https://polka.requestcatcher.com',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'PENDING_AUTHENTICATION (Challenge)' })
  async checkPayerAuthEnrollment(@Body() body: CheckPayerAuthEnrollmentDto) {
    return this.threeDsService.checkPayerAuthEnrollment(body);
  }

  @Post('validate-authentication-results')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description:
      'Validate Authentication Results. IMPORTANT: type = "VISA" pentru VISA, type = "MASTERCARD" pentru MASTERCARD.',
    examples: {
      visa: {
        summary: 'VISA (type = VISA)',
        value: {
          paymentInformation: { card: { type: 'VISA' } },
          consumerAuthenticationInformation: {
            authenticationTransactionId: 'k13m6hgiXkDkYveGr8f0',
          },
        },
      },
      mastercard: {
        summary: 'MASTERCARD (type = MASTERCARD)',
        value: {
          paymentInformation: { card: { type: 'MASTERCARD' } },
          consumerAuthenticationInformation: {
            authenticationTransactionId: 'k13m6hgiXkDkYveGr8f0',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Authentication validated successfully' })
  async validateAuthenticationResults(
    @Body() body: ValidateAuthenticationResultsDto,
  ) {
    return this.threeDsService.validateAuthenticationResults(body);
  }

  @Post('authorize-after-3ds')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description:
      'Authorize payment AFTER successful 3DS. IMPORTANT: pentru VISA foloseste type = "001", commerceIndicator = "vbv", cavv + xid. Pentru MASTERCARD foloseste type = "002", commerceIndicator = "spa", ucafAuthenticationData + ucafCollectionIndicator (in loc de cavv + xid).',
    examples: {
      visa: {
        summary: 'VISA (cavv + xid)',
        value: {
          clientReferenceInformation: { code: 'TC50171_3' },
          processingInformation: { commerceIndicator: 'vbv' },
          paymentInformation: {
            card: {
              type: '001',
              number: '4000000000002503',
              expirationMonth: '12',
              expirationYear: '2026',
            },
          },
          orderInformation: {
            amountDetails: { totalAmount: '10.99', currency: 'USD' },
            billTo: {
              firstName: 'John',
              lastName: 'Doe',
              address1: '1 Market St',
              locality: 'san francisco',
              administrativeArea: 'CA',
              postalCode: '94105',
              country: 'US',
              email: 'test@cybs.com',
              phoneNumber: '4158880000',
            },
          },
          consumerAuthenticationInformation: {
            cavv: 'AAABBBCCC123',
            xid: 'XID123456',
            eci: '05',
          },
        },
      },
      mastercard: {
        summary: 'MASTERCARD (ucafAuthenticationData + ucafCollectionIndicator)',
        value: {
          clientReferenceInformation: { code: 'TC50171_3' },
          processingInformation: { commerceIndicator: 'spa' },
          paymentInformation: {
            card: {
              type: '002',
              number: '5120342233150747',
              expirationMonth: '12',
              expirationYear: '2030',
            },
          },
          orderInformation: {
            amountDetails: { totalAmount: '10.99', currency: 'USD' },
            billTo: {
              firstName: 'John',
              lastName: 'Doe',
              address1: '1 Market St',
              locality: 'san francisco',
              administrativeArea: 'CA',
              postalCode: '94105',
              country: 'US',
              email: 'test@cybs.com',
              phoneNumber: '4158880000',
            },
          },
          consumerAuthenticationInformation: {
            ucafAuthenticationData: 'AAIBBYNoEwAAACcKhAJkdQAAAAA=',
            ucafCollectionIndicator: '2',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment authorized with 3DS data' })
  async authorizeAfter3ds(@Body() body: AuthorizeAfter3dsDto) {
    return this.threeDsService.authorizeAfter3ds(body);
  }

  @Post('capture/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'transactionId', description: 'Transaction ID from authorize-after-3ds' })
  @ApiBody({
    description: 'Capture (finalizare) tranzactie autorizata cu 3DS',
    examples: {
      default: {
        summary: 'Capture payment',
        value: {
          orderInformation: {
            amountDetails: { totalAmount: '10.99', currency: 'USD' },
          },
          clientReferenceInformation: { code: 'capture_3ds_001' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment captured successfully' })
  async capturePayment(
    @Param('transactionId') transactionId: string,
    @Body()
    body: {
      orderInformation: { amountDetails: { totalAmount: string; currency: string } };
      clientReferenceInformation?: { code: string };
    },
  ) {
    return this.threeDsService.capturePayment(
      transactionId,
      body.orderInformation.amountDetails.totalAmount,
      body.orderInformation.amountDetails.currency,
      body.clientReferenceInformation?.code,
    );
  }

  @Get('checkout')
  @ApiExcludeEndpoint()
  checkoutPage(@Res() res: Response) {
    res.type('text/html').send(CHECKOUT_PAGE_HTML);
  }

  @Post('process-checkout')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async processCheckout(@Body() body: { cardData: any; orderData: any }) {
    return this.threeDsService.processFullCheckout(
      body.cardData,
      body.orderData,
      'https://checkout-callback.requestcatcher.com',
    );
  }
}

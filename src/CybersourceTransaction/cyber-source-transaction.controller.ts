import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import { CyberSourceTransactionService } from './cyber-source-transaction.service';

// Importă decoratorii Swagger
import { ApiBody, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ZeroDollarAuthDto } from './dto/zero-dollar-auth.dto';

// IMPORTUL PENTRU AuthorizationSuccessResponseDto ESTE ELIMINAT.

@ApiTags('CyberSource Transactions')
@Controller('cybersource')
export class CyberSourceTransactionController {
  constructor(
    private readonly cyberSourceService: CyberSourceTransactionService,
  ) {}

  @Post('authorize-simple')
  @HttpCode(HttpStatus.OK)

  // Utilizează @ApiBody pentru a forța exemplul complet al REQUEST BODY
  @ApiBody({
    type: InitiatePaymentDto,
    examples: {
      simpleAuthExample: {
        summary: 'Exemplu Autorizare Simplă',
        value: {
          clientReferenceInformation: {
            code: 'TC50171_3',
          },
          paymentInformation: {
            card: {
              number: '4111111111111111',
              expirationMonth: '12',
              expirationYear: '2031',
            },
          },
          orderInformation: {
            amountDetails: {
              totalAmount: '102.21',
              currency: 'USD',
            },
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
        } as InitiatePaymentDto,
      },
    },
  })
  // MODIFICAT: Definește structura de RESPONSE direct prin 'content' și 'example', fără a folosi 'type: DTO'
  @ApiResponse({
    status: 200,
    description: 'Tranzacție Autorizată cu Succes',
    content: {
      'application/json': {
        schema: {
          properties: {
            message: { type: 'string' },
            status: { type: 'string' },
            transactionId: { type: 'string' },
          },
        },
        example: {
          message: 'Tranzacție Autorizată cu Succes.',
          status: 'AUTHORIZED',
          transactionId: '5877145717654321098765',
        },
      },
    },
  })
  async createPayment(@Body() body: InitiatePaymentDto) {
    const result = await this.cyberSourceService.simpleAuthorization(body);

    if (result.success) {
      return {
        message: 'Tranzacție Autorizată cu Succes.',
        status: result.status,
        transactionId: result.id,
      };
    } else {
      return {
        message: 'Eroare la Autorizare (Review sau Decline).',
        status: result.status,
        reason: result.errorReason,
        details: result.details,
      };
    }
  }

  // ENDPOINT PENTRU ZERO DOLLAR AUTHORIZATION
  @Post('authorize-zero')
  @HttpCode(HttpStatus.OK)

  // Injectează exemplul dorit de REQUEST BODY pentru Zero Dollar Auth
  @ApiBody({
    type: ZeroDollarAuthDto,
    examples: {
      zeroAuthExample: {
        summary: 'Exemplu Zero Dollar Authorization',
        value: {
          clientReferenceInformation: {
            code: 'ZERO_AUTH_TEST_42',
          },
          paymentInformation: {
            card: {
              number: '5555555555554444', // <--- Cardul specific de 0$ Auth
              expirationMonth: '12',
              expirationYear: '2031',
            },
          },
          orderInformation: {
            billTo: {
              firstName: 'Zero',
              lastName: 'Test',
              address1: '1 Market St',
              locality: 'san francisco',
              administrativeArea: 'CA',
              postalCode: '94105',
              country: 'US',
              email: 'zero_test@cybs.com',
              phoneNumber: '4158880000',
            },
          },
        } as ZeroDollarAuthDto,
      },
    },
  })
  // Definește structura de RESPONSE pentru Zero Dollar Auth
  @ApiResponse({
    status: 200,
    description: 'Autorizare Zero Dollar cu Succes',
    content: {
      'application/json': {
        schema: {
          properties: {
            message: { type: 'string' },
            status: { type: 'string' },
            transactionId: { type: 'string' },
          },
        },
        example: {
          message: 'Autorizare Zero Dollar cu Succes.',
          status: 'AUTHORIZED',
          transactionId: '5877145717654321999999',
        },
      },
    },
  })
  async zeroDollarAuthorization(@Body() body: ZeroDollarAuthDto) {
    const result = await this.cyberSourceService.zeroDollarAuthorization(body);

    if (result.success) {
      return {
        message: 'Autorizare Zero Dollar cu Succes.',
        status: result.status,
        transactionId: result.id,
      };
    } else {
      return {
        message: 'Eroare la Autorizare Zero Dollar.',
        status: result.status,
        reason: result.reason,
        details: result.details,
      };
    }
  }

  // ENDPOINT PENTRU AUTHORIZATION WITH CAPTURE (SALE)
  @Post('authorize-capture-sale')
  @HttpCode(HttpStatus.OK)

  // REQUEST BODY: Folosește același exemplu ca la authorize-simple
  @ApiBody({
    type: InitiatePaymentDto,
    examples: {
      saleAuthExample: {
        summary: 'Exemplu Autorizare cu Captură (Sale)',
        value: {
          clientReferenceInformation: { code: 'TC50171_3' },
          paymentInformation: {
            card: {
              number: '4111111111111111',
              expirationMonth: '12',
              expirationYear: '2031',
            },
          },
          orderInformation: {
            amountDetails: { totalAmount: '102.21', currency: 'USD' },
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
        } as InitiatePaymentDto,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sale/Captură cu Succes',
    content: {
      'application/json': {
        schema: {
          properties: {
            message: { type: 'string' },
            status: { type: 'string' },
            transactionId: { type: 'string' },
          },
        },
        example: {
          message: 'Tranzacție Vândută/Capturată cu Succes.',
          status: 'APPROVED',
          transactionId: '5877145717654321098765',
        },
      },
    },
  })
  async authorizationWithCaptureSale(@Body() body: InitiatePaymentDto) {
    const result = await this.cyberSourceService.saleAuthorization(body); // Apel la noua metodă

    if (result.success) {
      return {
        message: 'Tranzacție Sale/Capturată cu Succes.',
        status: result.status,
        transactionId: result.id,
      };
    } else {
      return {
        message: 'Eroare la Sale/Captură (Review sau Decline).',
        status: result.status,
        reason: result.errorReason,
        details: result.details,
      };
    }
  }

  @Post('void-payment/:transactionId/:clientRefCode') // URL cu două ID-uri
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'transactionId',
    description: 'ID-ul tranzacției de plată care trebuie anulată (Void).',
    example: '5877145717654321098765',
  })
  @ApiParam({
    // NOU: Parametru pentru codul de referință
    name: 'clientRefCode',
    description:
      'Codul de referință unic al clientului pentru operațiunea de anulare (Void).',
    example: 'TEST_VOID_002',
  })
  @ApiResponse({
    status: 200,
    description: 'Anulare (Void) cu Succes',
    content: {
      'application/json': {
        schema: {
          properties: {
            message: { type: 'string' },
            status: { type: 'string' },
            id: { type: 'string' },
          },
        },
        example: {
          message: 'Tranzacție anulată cu succes.',
          status: 'REVERSED',
          id: '5877145717654321098765',
        },
      },
    },
  })
  async voidTransaction(
    @Param('transactionId') transactionId: string, // Preluăm ID-ul tranzacției
    @Param('clientRefCode') clientRefCode: string, // Preluăm referința din URL
  ) {
    const result = await this.cyberSourceService.voidPayment(
      transactionId,
      clientRefCode, // Transmitem codul de referință la Service
    );

    if (result.success) {
      return result;
    } else {
      return {
        message: result.message,
        status: result.status,
        reason: result.reason,
        details: result.details,
      };
    }
  }

  // ENDPOINT: RETRIEVE TRANSACTION DETAILS (GET)
  @Get('transaction-details/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'transactionId',
    description:
      'ID-ul tranzacției CyberSource ale cărei detalii trebuie preluate.',
    example: '5877145717654321098765',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalii tranzacție preluate cu succes.',
    content: {
      'application/json': {
        schema: {
          properties: {
            message: { type: 'string' },
            success: { type: 'boolean' },
            details: { type: 'object' }, // Returnăm obiectul complet al tranzacției
          },
        },
        example: {
          success: true,
          message: 'Detalii tranzacție preluate cu succes.',
          details: {
            // Aici CyberSource returnează tot:
            // id: "5877145717654321098765",
            // submitTimeUtc: "2023-11-20T10:00:00Z",
            // status: "AUTHORIZED",
            // clientReferenceInformation: { code: "TC50171_3" },
            // orderInformation: { ... },
            // processorInformation: { ... },
            // etc.
          },
        },
      },
    },
  })
  async getTransactionDetails(@Param('transactionId') transactionId: string) {
    const result =
      await this.cyberSourceService.retrieveTransaction(transactionId);

    if (result.success) {
      return result;
    } else {
      // Această ramură prinde erorile 500 din Service, dar o lăsăm pentru consistență
      return {
        success: false,
        message: 'Eroare la preluarea detaliilor tranzacției.',
        details: result.details,
      };
    }
  }
}

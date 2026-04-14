import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiExcludeEndpoint, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { CheckEnrollmentDto } from './dto/check-enrollment.dto';
import { ThreeDsService } from './three-ds.service';
import { ValidateAuthenticationResultsDto } from './dto/validate-authentication-results.dto';
import { AuthorizeAfter3dsDto } from './dto/authorize-after-3ds.dto';

@ApiTags('3DS Transactions')
@Controller('3ds')
export class ThreeDsController {
  constructor(private readonly threeDsService: ThreeDsService) {}

  // ================= EXISTING 3DS ENROLLMENT =================
  @Post('setup-payer-auth')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: '3DS Check Enrollment',
    examples: {
      default: {
        summary: 'Card 3DS Enrollment',
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
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Raspuns 3DS Setup Completion',
  })
  async checkEnrollment(@Body() body: CheckEnrollmentDto) {
    return this.threeDsService.checkEnrollment(body);
  }

  // ================= EXISTING RISK AUTHENTICATION =================
  // @Post('risk-authentication')
  // @HttpCode(HttpStatus.OK)
  // async riskAuthentication(@Body() body: any) {
  //   return this.threeDsService.riskAuthentication(body);
  // }

  // ================= NEW CHECK PAYER AUTH ENROLLMENT =================
  // ================= NEW CHECK PAYER AUTH ENROLLMENT =================
  @Post('check-payer-auth-enrollment')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description:
      'Check Payer Auth Enrollment (3DS Challenge) , conform 3ds with token access from link: https://acs-sooty.vercel.app ',
    examples: {
      default: {
        summary: 'Check Payer Auth Enrollment - PENDING',
        value: {
          orderInformation: {
            amountDetails: {
              currency: 'USD',
              totalAmount: '10.99',
            },
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
          buyerInformation: {
            mobilePhone: '1245789632',
          },
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
  @ApiResponse({
    status: 200,
    description: 'PENDING_AUTHENTICATION (Challenge)',
  })
  async checkPayerAuthEnrollment(@Body() body: any) {
    return this.threeDsService.checkPayerAuthEnrollment(body);
  }

  @Post('validate-authentication-results')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Validate Authentication Results (Minimal Body)',
    examples: {
      default: {
        summary: 'Minimal 3DS Challenge Result',
        value: {
          paymentInformation: {
            card: {
              type: 'VISA',
            },
          },
          consumerAuthenticationInformation: {
            authenticationTransactionId: 'k13m6hgiXkDkYveGr8f0',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication validated successfully',
  })
  async validateAuthenticationResults(
    @Body() body: ValidateAuthenticationResultsDto,
  ) {
    return this.threeDsService.validateAuthenticationResults(body);
  }

  @Post('authorize-after-3ds')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Authorize payment AFTER successful 3DS (CAVV + XID)',
    examples: {
      default: {
        summary: 'Authorize with 3DS data',
        value: {
          clientReferenceInformation: {
            code: 'TC50171_3',
          },
          processingInformation: {
            commerceIndicator: 'vbv',
          },
          paymentInformation: {
            card: {
              number: '4000000000002503',
              expirationMonth: '12',
              expirationYear: '2026',
            },
          },
          orderInformation: {
            amountDetails: {
              totalAmount: '10.99',
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
          consumerAuthenticationInformation: {
            cavv: 'AAABBBCCC123',
            xid: 'XID123456',
            eci: '05',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment authorized with 3DS data',
  })
  async authorizeAfter3ds(@Body() body: AuthorizeAfter3dsDto) {
    return this.threeDsService.authorizeAfter3ds(body);
  }

  // ================= TOKEN 3DS: Step 1 - Initiate authentication with token =================
  @Post('token-checkout')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Initiate 3DS authentication using a saved customer token (repeat transaction)',
    examples: {
      default: {
        summary: 'Token 3DS Enrollment',
        value: {
          customerId: 'ABC123DEF456',
          orderInformation: {
            amountDetails: {
              totalAmount: '10.99',
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
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns accessToken for 3DS StepUp + authenticationTransactionId' })
  async tokenCheckout(@Body() body: any) {
    return this.threeDsService.processTokenCheckout(
      body.customerId,
      {
        totalAmount: body.orderInformation.amountDetails.totalAmount,
        currency: body.orderInformation.amountDetails.currency,
        firstName: body.orderInformation.billTo.firstName,
        lastName: body.orderInformation.billTo.lastName,
        email: body.orderInformation.billTo.email,
        address1: body.orderInformation.billTo.address1,
        locality: body.orderInformation.billTo.locality,
        administrativeArea: body.orderInformation.billTo.administrativeArea,
        postalCode: body.orderInformation.billTo.postalCode,
        country: body.orderInformation.billTo.country,
      },
      'https://checkout-callback.requestcatcher.com',
    );
  }

  // ================= TOKEN 3DS: Step 2 - Validate + Authorize + Capture with token =================
  @Post('token-authorize')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Validate 3DS + Authorize + Capture using customer token (after OTP completed)',
    examples: {
      default: {
        summary: 'Token Authorize after 3DS',
        value: {
          customerId: 'ABC123DEF456',
          clientReferenceCode: 'tkn_1234567890',
          authenticationTransactionId: 'fOyjABgCLcxKEkO7ElB0',
          orderInformation: {
            amountDetails: {
              totalAmount: '10.99',
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
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment authorized + captured with token and 3DS' })
  async tokenAuthorize(@Body() body: any) {
    return this.threeDsService.authorizeTokenAfter3ds(
      body.customerId,
      body.clientReferenceCode,
      body.authenticationTransactionId,
      {
        totalAmount: body.orderInformation.amountDetails.totalAmount,
        currency: body.orderInformation.amountDetails.currency,
        firstName: body.orderInformation.billTo.firstName,
        lastName: body.orderInformation.billTo.lastName,
        email: body.orderInformation.billTo.email,
        address1: body.orderInformation.billTo.address1,
        locality: body.orderInformation.billTo.locality,
        administrativeArea: body.orderInformation.billTo.administrativeArea,
        postalCode: body.orderInformation.billTo.postalCode,
        country: body.orderInformation.billTo.country,
        phoneNumber: body.orderInformation.billTo.phoneNumber,
      },
    );
  }

  // ================= CAPTURE (Finalizare tranzactie 3DS) =================
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
            amountDetails: {
              totalAmount: '10.99',
              currency: 'USD',
            },
          },
          clientReferenceInformation: {
            code: 'capture_3ds_001',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payment captured successfully' })
  async capturePayment(
    @Param('transactionId') transactionId: string,
    @Body() body: {
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

  // ================= CHECKOUT PAGE (Full 3DS Flow) =================
  @Get('checkout')
  @ApiExcludeEndpoint()
  async checkoutPage(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>3DS Checkout</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; }
    h2 { text-align: center; margin-bottom: 20px; color: #333; }
    .card { background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .card h3 { margin-bottom: 16px; color: #555; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .row { display: flex; gap: 12px; }
    .field { margin-bottom: 14px; flex: 1; }
    .field label { display: block; font-size: 13px; color: #666; margin-bottom: 4px; }
    .field input, .field select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .field input:focus, .field select:focus { outline: none; border-color: #4a90d9; }
    #payBtn { width: 100%; padding: 14px; background: #4a90d9; color: #fff; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: 600; }
    #payBtn:hover { background: #3a7bc8; }
    #payBtn:disabled { background: #aaa; cursor: not-allowed; }
    #status { margin-top: 16px; padding: 12px; border-radius: 6px; display: none; font-size: 14px; }
    #status.info { display: block; background: #e8f4fd; color: #1a73e8; }
    #status.success { display: block; background: #e6f4ea; color: #137333; }
    #status.error { display: block; background: #fce8e6; color: #c5221f; }
    .iframe-container { display: none; margin-top: 20px; }
    .iframe-container iframe { width: 100%; height: 520px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
    .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px; }
    .spinner-dark { border-color: #1a73e8; border-top-color: transparent; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>

<div class="container">
  <h2>3DS Checkout</h2>

  <div class="card">
    <h3>Card Details</h3>
    <div class="field">
      <label>Card Number</label>
      <input type="text" id="cardNumber" value="4000000000002503" maxlength="19">
    </div>
    <div class="row">
      <div class="field">
        <label>Exp Month</label>
        <input type="text" id="expMonth" value="12" maxlength="2">
      </div>
      <div class="field">
        <label>Exp Year</label>
        <input type="text" id="expYear" value="2026" maxlength="4">
      </div>
      <div class="field">
        <label>Card Type</label>
        <select id="cardType">
          <option value="001">Visa</option>
          <option value="002">Mastercard</option>
          <option value="003">Amex</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    <h3>Order Details</h3>
    <div class="row">
      <div class="field">
        <label>Amount</label>
        <input type="text" id="amount" value="10.99">
      </div>
      <div class="field">
        <label>Currency</label>
        <select id="currency">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    <h3>Billing Info</h3>
    <div class="row">
      <div class="field">
        <label>First Name</label>
        <input type="text" id="firstName" value="John">
      </div>
      <div class="field">
        <label>Last Name</label>
        <input type="text" id="lastName" value="Doe">
      </div>
    </div>
    <div class="field">
      <label>Email</label>
      <input type="email" id="email" value="test@cybs.com">
    </div>
    <div class="field">
      <label>Address</label>
      <input type="text" id="address1" value="1 Market St">
    </div>
    <div class="row">
      <div class="field">
        <label>City</label>
        <input type="text" id="locality" value="san francisco">
      </div>
      <div class="field">
        <label>State</label>
        <input type="text" id="adminArea" value="CA">
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>Postal Code</label>
        <input type="text" id="postalCode" value="94105">
      </div>
      <div class="field">
        <label>Country</label>
        <input type="text" id="country" value="US">
      </div>
    </div>
  </div>

  <button id="payBtn" onclick="startCheckout()">Plateste</button>
  <div id="status"></div>

  <div class="iframe-container" id="iframeContainer">
    <iframe name="stepup_iframe" id="stepupIframe"></iframe>
    <button id="confirmBtn" onclick="confirmPayment()" style="display:none; width:100%; padding:14px; background:#28a745; color:#fff; border:none; border-radius:6px; font-size:16px; cursor:pointer; font-weight:600; margin-top:10px;">
      Finalizeaza plata
    </button>
  </div>

  <form id="stepupForm" method="POST" target="stepup_iframe">
    <input type="hidden" name="JWT" id="jwtInput">
    <input type="hidden" name="MD" value="checkout-flow">
  </form>
</div>

<script>
  let checkoutState = {};
  let pollTimer = null;

  // Map numeric card type to string for validate call
  const cardTypeMap = { '001': 'VISA', '002': 'MASTERCARD', '003': 'AMEX', '004': 'DISCOVER' };

  function setStatus(msg, type) {
    const el = document.getElementById('status');
    el.className = type;
    el.innerHTML = msg;
  }

  function resetBtn() {
    const btn = document.getElementById('payBtn');
    btn.disabled = false;
    btn.textContent = 'Plateste';
  }

  async function startCheckout() {
    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Se proceseaza...';

    const cardData = {
      type: document.getElementById('cardType').value,
      number: document.getElementById('cardNumber').value.replace(/\\s/g, ''),
      expirationMonth: document.getElementById('expMonth').value,
      expirationYear: document.getElementById('expYear').value,
    };

    const orderData = {
      totalAmount: document.getElementById('amount').value,
      currency: document.getElementById('currency').value,
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      address1: document.getElementById('address1').value,
      locality: document.getElementById('locality').value,
      administrativeArea: document.getElementById('adminArea').value,
      postalCode: document.getElementById('postalCode').value,
      country: document.getElementById('country').value,
    };

    try {
      setStatus('Pas 1/2: Initializare autentificare...', 'info');

      const resp = await fetch('/3ds/process-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardData, orderData }),
      });

      const result = await resp.json();

      if (!result.accessToken) {
        throw new Error('Nu s-a primit accessToken de la CyberSource');
      }

      checkoutState = { cardData, orderData, ...result };

      setStatus('Pas 2/2: Confirma autentificarea si asteapta finalizarea...', 'info');

      // Show iframe and submit StepUp form to Cardinal
      document.getElementById('iframeContainer').style.display = 'block';
      document.getElementById('jwtInput').value = result.accessToken;

      const form = document.getElementById('stepupForm');
      form.action = result.stepUpUrl;
      form.submit();

      // Start polling for authentication completion
      startPolling();

    } catch (err) {
      setStatus('Eroare: ' + err.message, 'error');
      resetBtn();
    }
  }

  function startPolling() {
    let attempts = 0;
    const maxAttempts = 60; // 3 min max (60 x 3s)

    pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollTimer);
        setStatus('Timeout - autentificarea nu a fost completata in timp util.', 'error');
        resetBtn();
        return;
      }

      try {
        // Call authorize-after-3ds which now includes VALIDATE_CONSUMER_AUTHENTICATION
        // It will validate + authorize + capture in ONE call
        // If user hasn't completed OTP yet, this will fail and we retry
        const s = checkoutState;
        const resp = await fetch('/3ds/authorize-after-3ds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientReferenceInformation: { code: s.clientReferenceCode },
            processingInformation: { commerceIndicator: 'vbv' },
            paymentInformation: {
              card: {
                number: s.cardData.number,
                expirationMonth: s.cardData.expirationMonth,
                expirationYear: s.cardData.expirationYear,
              },
            },
            orderInformation: {
              amountDetails: {
                totalAmount: s.orderData.totalAmount,
                currency: s.orderData.currency,
              },
              billTo: {
                firstName: s.orderData.firstName,
                lastName: s.orderData.lastName,
                address1: s.orderData.address1,
                locality: s.orderData.locality,
                administrativeArea: s.orderData.administrativeArea,
                postalCode: s.orderData.postalCode,
                country: s.orderData.country,
                email: s.orderData.email,
                phoneNumber: '4158880000',
              },
            },
            consumerAuthenticationInformation: {
              authenticationTransactionId: s.authenticationTransactionId,
            },
          }),
        });

        const result = await resp.json();

        if (result.success && (result.status === 'AUTHORIZED' || result.status === 'PENDING')) {
          clearInterval(pollTimer);
          setStatus(
            'Tranzactie completa! Transaction ID: ' + result.id +
            ' | Status: ' + result.status,
            'success'
          );
          document.getElementById('iframeContainer').style.display = 'none';
          resetBtn();
        }
        // If not successful, keep polling (user may not have completed OTP yet)
      } catch (e) {
        // Not ready yet, keep polling
      }
    }, 3000);
  }
</script>

</body>
</html>`;

    res.type('text/html').send(html);
  }

  // ================= PROCESS CHECKOUT (combines setup + enrollment) =================
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

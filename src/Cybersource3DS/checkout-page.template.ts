export const CHECKOUT_PAGE_HTML = `<!DOCTYPE html>
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
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
<div class="container">
  <h2>3DS Checkout</h2>
  <div class="card">
    <h3>Card Details</h3>
    <div class="field"><label>Card Number</label><input type="text" id="cardNumber" value="4000000000002503" maxlength="19"></div>
    <div class="row">
      <div class="field"><label>Exp Month</label><input type="text" id="expMonth" value="12" maxlength="2"></div>
      <div class="field"><label>Exp Year</label><input type="text" id="expYear" value="2026" maxlength="4"></div>
      <div class="field"><label>Card Type</label><select id="cardType"><option value="001">Visa</option><option value="002">Mastercard</option><option value="003">Amex</option></select></div>
    </div>
  </div>
  <div class="card">
    <h3>Order Details</h3>
    <div class="row">
      <div class="field"><label>Amount</label><input type="text" id="amount" value="10.99"></div>
      <div class="field"><label>Currency</label><select id="currency"><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
    </div>
  </div>
  <div class="card">
    <h3>Billing Info</h3>
    <div class="row">
      <div class="field"><label>First Name</label><input type="text" id="firstName" value="John"></div>
      <div class="field"><label>Last Name</label><input type="text" id="lastName" value="Doe"></div>
    </div>
    <div class="field"><label>Email</label><input type="email" id="email" value="test@cybs.com"></div>
    <div class="field"><label>Address</label><input type="text" id="address1" value="1 Market St"></div>
    <div class="row">
      <div class="field"><label>City</label><input type="text" id="locality" value="san francisco"></div>
      <div class="field"><label>State</label><input type="text" id="adminArea" value="CA"></div>
    </div>
    <div class="row">
      <div class="field"><label>Postal Code</label><input type="text" id="postalCode" value="94105"></div>
      <div class="field"><label>Country</label><input type="text" id="country" value="US"></div>
    </div>
  </div>
  <button id="payBtn" onclick="startCheckout()">Plateste</button>
  <div id="status"></div>
  <div class="iframe-container" id="iframeContainer">
    <iframe name="stepup_iframe" id="stepupIframe"></iframe>
  </div>
  <form id="stepupForm" method="POST" target="stepup_iframe">
    <input type="hidden" name="JWT" id="jwtInput">
    <input type="hidden" name="MD" value="checkout-flow">
  </form>
</div>
<script>
  let checkoutState = {};
  let pollTimer = null;

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
      if (!result.accessToken) throw new Error('Nu s-a primit accessToken de la CyberSource');

      checkoutState = { cardData, orderData, ...result };
      setStatus('Pas 2/2: Confirma autentificarea si asteapta finalizarea...', 'info');
      document.getElementById('iframeContainer').style.display = 'block';
      document.getElementById('jwtInput').value = result.accessToken;
      const form = document.getElementById('stepupForm');
      form.action = result.stepUpUrl;
      form.submit();
      startPolling();
    } catch (err) {
      setStatus('Eroare: ' + err.message, 'error');
      resetBtn();
    }
  }

  function startPolling() {
    let attempts = 0;
    const maxAttempts = 60;
    pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollTimer);
        setStatus('Timeout - autentificarea nu a fost completata in timp util.', 'error');
        resetBtn();
        return;
      }
      try {
        const s = checkoutState;
        const resp = await fetch('/3ds/authorize-after-3ds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientReferenceInformation: { code: s.clientReferenceCode },
            processingInformation: { commerceIndicator: 'vbv' },
            paymentInformation: {
              card: { number: s.cardData.number, expirationMonth: s.cardData.expirationMonth, expirationYear: s.cardData.expirationYear },
            },
            orderInformation: {
              amountDetails: { totalAmount: s.orderData.totalAmount, currency: s.orderData.currency },
              billTo: { firstName: s.orderData.firstName, lastName: s.orderData.lastName, address1: s.orderData.address1, locality: s.orderData.locality, administrativeArea: s.orderData.administrativeArea, postalCode: s.orderData.postalCode, country: s.orderData.country, email: s.orderData.email, phoneNumber: '4158880000' },
            },
            consumerAuthenticationInformation: { authenticationTransactionId: s.authenticationTransactionId },
          }),
        });
        const result = await resp.json();
        if (result.success && (result.status === 'AUTHORIZED' || result.status === 'PENDING')) {
          clearInterval(pollTimer);
          setStatus('Tranzactie completa! Transaction ID: ' + result.id + ' | Status: ' + result.status, 'success');
          document.getElementById('iframeContainer').style.display = 'none';
          resetBtn();
        }
      } catch (e) { /* retry */ }
    }, 3000);
  }
</script>
</body>
</html>`;

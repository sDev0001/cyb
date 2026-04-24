import * as dotenv from 'dotenv';

dotenv.config();

export function Configuration(): any {
  const missing: string[] = [];
  const required = [
    'CYBERSOURCE_MERCHANT_ID',
    'CYBERSOURCE_MERCHANT_KEY_ID',
    'CYBERSOURCE_MERCHANT_SECRET_KEY',
  ];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required CyberSource env vars: ${missing.join(', ')}. See .env.example.`,
    );
  }

  return {
    authenticationType: process.env.CYBERSOURCE_AUTH_TYPE || 'http_signature',
    runEnvironment:
      process.env.CYBERSOURCE_RUN_ENVIRONMENT || 'apitest.cybersource.com',

    merchantID: process.env.CYBERSOURCE_MERCHANT_ID,
    merchantKeyId: process.env.CYBERSOURCE_MERCHANT_KEY_ID,
    merchantsecretKey: process.env.CYBERSOURCE_MERCHANT_SECRET_KEY,

    keyAlias: process.env.CYBERSOURCE_KEY_ALIAS,
    keyPass: process.env.CYBERSOURCE_KEY_PASS,
    keyFileName: process.env.CYBERSOURCE_KEY_FILE_NAME,
    keysDirectory: process.env.CYBERSOURCE_KEYS_DIRECTORY || 'Resource',

    logConfiguration: {
      logFileMaxSize: process.env.CYBERSOURCE_LOG_FILE_MAX_SIZE || '5242880',
      loggingLevel: process.env.CYBERSOURCE_LOGGING_LEVEL || 'debug',
      enableMasking: process.env.CYBERSOURCE_ENABLE_MASKING !== 'false',
    },
  };
}

export const partnerIds = {
  developerId: process.env.CYBERSOURCE_PARTNER_DEVELOPER_ID || '7891234',
  solutionId: process.env.CYBERSOURCE_PARTNER_SOLUTION_ID || '89012345',
};

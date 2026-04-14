const AuthenticationType: string = 'http_signature';
const RunEnvironment: string = 'apitest.cybersource.com';
const MerchantId: string = 'ebilete001';

const MerchantKeyId: string = '41ef2ed8-42a2-4a59-8dca-863d7f9c3b13';
const MerchantSecretKey: string = 'Nku+kCZUUVffNEacbM3plu2bYQRf+xnVfnMQ1sHh3y0=';

const KeysDirectory: string = 'Resource';
const KeyFileName: string = 'ebilete001';
const KeyAlias: string = 'ebilete001';
const KeyPass: string = 'ebilete001';

const EnableLog: boolean = true;
const LogFileName: string = 'cybs';

const LogDirectory: string | null = null;

const LogfileMaxSize: string = '5242880';
const EnableMasking: boolean = true;
const LoggingLevel: string = 'debug';

export function Configuration(): any {
  const configObj = {
    authenticationType: AuthenticationType,
    runEnvironment: RunEnvironment,

    merchantID: MerchantId,
    merchantKeyId: MerchantKeyId,
    merchantsecretKey: MerchantSecretKey,

    keyAlias: KeyAlias,
    keyPass: KeyPass,
    keyFileName: KeyFileName,
    keysDirectory: KeysDirectory,

    logConfiguration: {
      // enableLog: EnableLog,
      // logFileName: LogFileName,
      // logDirectory: LogDirectory,
      logFileMaxSize: LogfileMaxSize,
      loggingLevel: LoggingLevel,
      enableMasking: EnableMasking,
    },
  };
  return configObj;
}

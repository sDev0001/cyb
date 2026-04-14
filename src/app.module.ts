import { Module } from '@nestjs/common';
import { CyberSourceTransactionModule } from './CybersourceTransaction/cyber-source-transaction.module';
import { CybersourceUnifiedCheckoutModule } from './CybersourceUnifiedCheckout/cybersource-unified-checkout.module';
import { ThreeDsModule } from './Cybersource3DS/three-ds.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    CyberSourceTransactionModule,
    CybersourceUnifiedCheckoutModule,
    ThreeDsModule,
  ],
})
export class AppModule {}

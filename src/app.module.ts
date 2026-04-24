import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CybersourceClientModule } from './shared/cybersource-client.module';
import { CyberSourceTransactionModule } from './CybersourceTransaction/cyber-source-transaction.module';
import { CybersourceUnifiedCheckoutModule } from './CybersourceUnifiedCheckout/cybersource-unified-checkout.module';
import { ThreeDsModule } from './Cybersource3DS/three-ds.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CybersourceClientModule,
    CyberSourceTransactionModule,
    CybersourceUnifiedCheckoutModule,
    ThreeDsModule,
  ],
})
export class AppModule {}

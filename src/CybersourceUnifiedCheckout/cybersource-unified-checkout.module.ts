// src/cybersource-unified-checkout/cybersource-unified-checkout.module.ts

import { Module } from '@nestjs/common';
import { CybersourceUnifiedCheckoutController } from './cybersource-unified-checkout.controller';
import { CybersourceUnifiedCheckoutService } from './cybersource-unified-checkout.service';

@Module({
  imports: [], // Nu sunt necesare alte module de import
  controllers: [CybersourceUnifiedCheckoutController],
  providers: [CybersourceUnifiedCheckoutService],
  exports: [CybersourceUnifiedCheckoutService], // Exportăm dacă este nevoie să fie injectat în alt modul
})
export class CybersourceUnifiedCheckoutModule {}

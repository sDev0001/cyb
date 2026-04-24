import { Global, Module } from '@nestjs/common';
import { CybersourceClientService } from './cybersource-client.service';

@Global()
@Module({
  providers: [CybersourceClientService],
  exports: [CybersourceClientService],
})
export class CybersourceClientModule {}

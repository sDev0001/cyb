import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CyberSourceTransactionController } from './cyber-source-transaction.controller';
import { CyberSourceTransactionService } from './cyber-source-transaction.service';

@Module({
  imports: [ConfigModule],
  controllers: [CyberSourceTransactionController],
  providers: [CyberSourceTransactionService],
  exports: [CyberSourceTransactionService],
})
export class CyberSourceTransactionModule {}

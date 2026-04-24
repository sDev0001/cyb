import { Module } from '@nestjs/common';
import { CyberSourceTransactionController } from './cyber-source-transaction.controller';
import { CyberSourceTransactionService } from './cyber-source-transaction.service';

@Module({
  controllers: [CyberSourceTransactionController],
  providers: [CyberSourceTransactionService],
  exports: [CyberSourceTransactionService],
})
export class CyberSourceTransactionModule {}

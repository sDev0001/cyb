import { Module } from '@nestjs/common';
import { ThreeDsController } from './three-ds.controller';
import { ThreeDsService } from './three-ds.service';

@Module({
  controllers: [ThreeDsController],
  providers: [ThreeDsService],
  exports: [ThreeDsService],
})
export class ThreeDsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThreeDsController } from './three-ds.controller';
import { ThreeDsService } from './three-ds.service';

@Module({
  imports: [ConfigModule],
  controllers: [ThreeDsController],
  providers: [ThreeDsService],
  exports: [ThreeDsService],
})
export class ThreeDsModule {}

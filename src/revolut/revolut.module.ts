import { Module } from '@nestjs/common';
import { RevolutController } from './revolut.controller';
import { RevolutService } from './revolut.service';
import { RevolutAdapter } from './adapters/revolut.adapter';

@Module({
  controllers: [RevolutController],
  providers: [RevolutService, RevolutAdapter],
  exports: [RevolutService, RevolutAdapter],
})
export class RevolutModule {}

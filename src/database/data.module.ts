import { Global, Module } from '@nestjs/common';
import { DataSourceService } from './data-source.service.js';

@Global()
@Module({
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataModule {}

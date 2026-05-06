import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CustomThrottlerGuard } from './throttler.guard';

@Global()
@Module({
  providers: [CacheService, CustomThrottlerGuard],
  exports: [CacheService, CustomThrottlerGuard],
})
export class CommonModule {}

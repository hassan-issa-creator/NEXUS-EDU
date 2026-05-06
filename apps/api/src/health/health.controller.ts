import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  async check() {
    const health = await this.metricsService.getHealthStatus();
    return {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for Kubernetes' })
  async ready() {
    const health = await this.metricsService.getHealthStatus();
    return {
      status: health.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: health.checks,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for Kubernetes' })
  live() {
    return {
      status: 'live',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get detailed system metrics' })
  async metrics(): Promise<Record<string, unknown>> {
    return (await this.metricsService.getMetrics()) as unknown as Record<
      string,
      unknown
    >;
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health with all checks' })
  async detailed() {
    const [metrics, health] = await Promise.all([
      this.metricsService.getMetrics(),
      this.metricsService.getHealthStatus(),
    ]);

    return {
      status: health.status,
      timestamp: metrics.timestamp,
      uptime: metrics.uptime,
      memory: {
        heapUsed: `${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(metrics.memory.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(metrics.memory.rss / 1024 / 1024)}MB`,
      },
      database: metrics.database,
      performance: metrics.performance,
      checks: health.checks,
    };
  }
}

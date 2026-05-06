import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
    private readonly logger = new Logger(PerformanceInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;
                // Log a warning if the request takes more than 1 second (1000ms)
                if (duration > 1000) {
                    this.logger.warn(`SLOW API Execution Flagged | ${method} ${url} | Duration: ${duration}ms`);
                }
            })
        );
    }
}

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        if (request.body && typeof request.body === 'object') {
            this.sanitizeObject(request.body);
        }

        return next.handle();
    }

    private sanitizeObject(obj: any): void {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Basic XSS protection: strip out script tags and inline event handlers
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/on\w+="[^"]*"/gi, '')
                    .replace(/on\w+='[^']*'/gi, '')
                    .replace(/on\w+=\w+/gi, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.sanitizeObject(obj[key]);
            }
        }
    }
}

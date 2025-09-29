import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        if (user) {
          this.auditService.log({
            userId: user.userId,
            action: auditOptions.action,
            resource: auditOptions.resource,
            resourceId: request.params.id,
            details: {
              method: request.method,
              url: request.url,
              body: request.body,
            },
            ipAddress: request.ip,
            userAgent: request.get('User-Agent'),
          });
        }
      }),
    );
  }
}
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    // Admin can access everything
    if (user.role === 'admin') {
      return true;
    }

    // Check if user owns the resource
    const resourceUserId = request.params.userId || resourceId;
    if (user.userId !== resourceUserId) {
      throw new ForbiddenException('You can only access your own resources');
    }

    return true;
  }
}
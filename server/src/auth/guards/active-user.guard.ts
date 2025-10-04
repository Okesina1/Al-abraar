import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !user.userId) return true; // not an authenticated route or no user info

    const found = await this.usersService.findById(user.userId);
    if (!found) return true;
    if ((found as any).status === 'suspended') {
      throw new ForbiddenException('Your account is suspended');
    }
    return true;
  }
}

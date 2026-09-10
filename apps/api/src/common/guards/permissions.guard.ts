import {
  ForbiddenException,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionCode } from '../constants/permissions';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.method === 'OPTIONS') {
      return true;
    }
    const required = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const hasAll = required.every((permission) =>
      user.permissions.includes(permission),
    );
    if (!hasAll) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}

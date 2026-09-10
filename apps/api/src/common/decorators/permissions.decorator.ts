import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../constants/permissions';

export const PERMISSIONS_KEY = 'requiredPermissions';

/** Requires the authenticated user's role to hold ALL of the given permission codes. */
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

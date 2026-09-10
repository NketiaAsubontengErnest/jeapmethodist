export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

/** Shape encoded inside the signed access token. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

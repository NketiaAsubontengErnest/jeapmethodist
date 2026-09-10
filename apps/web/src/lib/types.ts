export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

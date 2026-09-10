export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string;
  /** Origin used to build absolute URLs for uploaded media (e.g. http://localhost:4000). */
  publicOrigin: string;
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  defaults: {
    currency: string;
    timezone: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.API_PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  publicOrigin: process.env.PUBLIC_API_ORIGIN ?? `http://localhost:${process.env.API_PORT ?? '4000'}`,
  jwt: {
    accessSecret:
      process.env.JWT_SECRET ||
      'YRhmE7bE_jUWddqWhtAIJER0YCRUfSse9xQ09mevXDDS1xWVguoWiFnXJtFilgLT',
    accessExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'KvajkTpgSTQJMV3asuqkNU3ftED2iu7tWYbEq7Luh3YhxJ7aB_GBrmU_16RGfPBQ',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  defaults: {
    currency: process.env.DEFAULT_CURRENCY ?? 'GHS',
    timezone: process.env.DEFAULT_TIMEZONE ?? 'Africa/Accra',
  },
});

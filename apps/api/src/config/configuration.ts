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

export default (): AppConfig => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET must be set in the environment (local .env for dev, Vercel project settings for production).',
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.API_PORT ?? '4000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN ?? 'https://jeapmethodist.vercel.app',
    publicOrigin: process.env.PUBLIC_API_ORIGIN ?? 'https://jeapmethodistapi.vercel.app',
    jwt: {
      accessSecret: process.env.JWT_SECRET,
      accessExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    defaults: {
      currency: process.env.DEFAULT_CURRENCY ?? 'GHS',
      timezone: process.env.DEFAULT_TIMEZONE ?? 'Africa/Accra',
    },
  };
};

import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class SafeThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: any): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req?.method === 'OPTIONS') {
      return true;
    }
    return super.canActivate(context);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const rawIp =
      req.headers?.['x-forwarded-for'] ||
      req.headers?.['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';

    const ipStr = Array.isArray(rawIp) ? rawIp[0] : String(rawIp);
    return ipStr.split(',')[0].trim();
  }
}

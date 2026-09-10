import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { generateRandomToken, hashToken } from '../common/utils/crypto.util';
import { parseDurationToMs } from '../common/utils/duration.util';
import { AccessTokenPayload } from './types/authenticated-user.interface';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  private async loadUserWithPermissions(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
  }

  private async issueTokenPair(
    user: { id: string; email: string; role: { id: string; name: string } },
    permissions: string[],
    meta: RequestMeta,
  ) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.role.id,
      roleName: user.role.name,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    const rawRefreshToken = generateRandomToken();
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(rawRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + parseDurationToMs(refreshExpiresIn)),
        createdByIp: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (!user) {
      await this.auditService.record({
        action: 'auth.login_failed',
        module: 'auth',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        newValue: { email: dto.email, reason: 'user_not_found' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.auditService.record({
        userId: user.id,
        action: 'auth.login_blocked',
        module: 'auth',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException(
        'This account is temporarily locked due to multiple failed login attempts. Please try again later.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null,
        },
      });

      await this.auditService.record({
        userId: user.id,
        action: shouldLock ? 'auth.account_locked' : 'auth.login_failed',
        module: 'auth',
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const permissions = user.role.permissions.map((rp) => rp.permission.code);
    const tokens = await this.issueTokenPair(user, permissions, meta);

    await this.auditService.record({
      userId: user.id,
      action: 'auth.login_success',
      module: 'auth',
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions,
      },
    };
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta) {
    const tokenHash = hashToken(rawRefreshToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.loadUserWithPermissions(existing.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Account is inactive or no longer exists',
      );
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.code);
    const tokens = await this.issueTokenPair(user, permissions, meta);

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return tokens;
  }

  async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    meta: RequestMeta,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditService.record({
      userId,
      action: 'auth.password_changed',
      module: 'auth',
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  /**
   * Always responds the same way whether or not the email exists, to avoid
   * leaking which addresses have accounts. Delivering the reset link is left
   * to the notifications/email module (see docs/architecture.md).
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (user) {
      const rawToken = generateRandomToken(32);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: hashToken(rawToken),
          passwordResetExpiresAt: new Date(
            Date.now() + PASSWORD_RESET_EXPIRY_MS,
          ),
        },
      });
      // TODO(notifications): send `rawToken` via the email provider once the
      // notifications module (Phase 9+) is wired up. Logged here for local dev only.
      this.logger.debug(`Password reset token for ${user.email}: ${rawToken}`);
    }

    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'This password reset link is invalid or has expired',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditService.record({
      userId: user.id,
      action: 'auth.password_reset',
      module: 'auth',
    });

    return { message: 'Password has been reset successfully. Please log in.' };
  }
}

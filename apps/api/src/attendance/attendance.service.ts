import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

const sessionListInclude = {
  programmeType: true,
  recordedByUser: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { records: true } },
} as const;

const sessionDetailInclude = {
  programmeType: true,
  recordedByUser: { select: { id: true, firstName: true, lastName: true } },
  records: {
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          membershipNumber: true,
          gender: true,
          memberCategory: { select: { name: true } },
        },
      },
      visitor: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { recordedAt: 'desc' as const },
  },
} as const;

export interface FindAllSessionsParams {
  page: number;
  pageSize: number;
  programmeTypeId?: string;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllSessions(params: FindAllSessionsParams) {
    const { page, pageSize, programmeTypeId, fromDate, toDate } = params;

    const where: Prisma.AttendanceSessionWhereInput = {
      ...(programmeTypeId ? { programmeTypeId } : {}),
      ...(fromDate || toDate
        ? {
            sessionDate: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        include: sessionListInclude,
        orderBy: { sessionDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: sessionDetailInclude,
    });
    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    return session;
  }

  createSession(dto: CreateSessionDto, recordedByUserId: string) {
    return this.prisma.attendanceSession.create({
      data: { ...dto, recordedByUserId },
      include: sessionListInclude,
    });
  }

  async updateSession(id: string, dto: UpdateSessionDto) {
    await this.findSession(id);
    return this.prisma.attendanceSession.update({
      where: { id },
      data: dto,
      include: sessionListInclude,
    });
  }

  async removeSession(id: string) {
    await this.findSession(id);
    await this.prisma.attendanceSession.delete({ where: { id } });
    return { message: 'Attendance session deleted' };
  }

  async addRecord(sessionId: string, dto: CreateRecordDto) {
    await this.findSession(sessionId);

    const isMemberStatus = dto.status !== AttendanceStatus.VISITOR;
    if (isMemberStatus && !dto.memberId) {
      throw new BadRequestException(
        'A member must be selected for Present/Absent/Excused records',
      );
    }

    if (dto.memberId) {
      const existing = await this.prisma.attendanceRecord.findUnique({
        where: { sessionId_memberId: { sessionId, memberId: dto.memberId } },
      });
      if (existing) {
        throw new ConflictException(
          'This member already has an attendance record for this session — edit it instead',
        );
      }
    }

    await this.prisma.attendanceRecord.create({
      data: {
        sessionId,
        status: dto.status,
        memberId: isMemberStatus ? dto.memberId : null,
        visitorId: dto.visitorId,
        visitorName: dto.visitorName,
        notes: dto.notes,
      },
    });

    return this.findSession(sessionId);
  }

  async updateRecord(
    sessionId: string,
    recordId: string,
    dto: UpdateRecordDto,
  ) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record || record.sessionId !== sessionId) {
      throw new NotFoundException('Attendance record not found');
    }
    await this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: dto,
    });
    return this.findSession(sessionId);
  }

  async removeRecord(sessionId: string, recordId: string) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record || record.sessionId !== sessionId) {
      throw new NotFoundException('Attendance record not found');
    }
    await this.prisma.attendanceRecord.delete({ where: { id: recordId } });
    return this.findSession(sessionId);
  }

  /**
   * Aggregated attendance report. Kept as an in-memory reduction over the
   * (modest, single-church-scale) result set rather than raw SQL — simpler to
   * read and maintain, and plenty fast at this scale.
   */
  async getSummary(params: {
    from: Date;
    to: Date;
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
  }) {
    const { from, to, groupBy } = params;

    const sessions = await this.prisma.attendanceSession.findMany({
      where: { sessionDate: { gte: from, lte: to } },
      include: {
        programmeType: { select: { name: true } },
        records: {
          include: {
            member: {
              select: {
                gender: true,
                memberCategory: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { sessionDate: 'asc' },
    });

    const visitorAttendanceCounts = new Map<string, number>();

    const perSession = sessions.map((session) => {
      let male = 0;
      let female = 0;
      let children = 0;
      let youth = 0;
      let visitors = 0;
      let returningVisitors = 0;

      for (const record of session.records) {
        if (record.status === AttendanceStatus.VISITOR) {
          visitors += 1;
          if (record.visitorId) {
            const seen =
              (visitorAttendanceCounts.get(record.visitorId) ?? 0) + 1;
            visitorAttendanceCounts.set(record.visitorId, seen);
            if (seen > 1) returningVisitors += 1;
          }
          continue;
        }
        if (record.status !== AttendanceStatus.PRESENT) continue;

        if (record.member?.gender === 'MALE') male += 1;
        if (record.member?.gender === 'FEMALE') female += 1;
        const categoryName = record.member?.memberCategory?.name;
        if (categoryName === 'Children') children += 1;
        if (categoryName === 'Youth' || categoryName === 'Young Adult')
          youth += 1;
      }

      const total = male + female + visitors;

      return {
        sessionId: session.id,
        sessionDate: session.sessionDate,
        programmeType: session.programmeType.name,
        total,
        male,
        female,
        children,
        youth,
        visitors,
        returningVisitors,
      };
    });

    const bucketKey = (date: Date) => {
      const d = new Date(date);
      switch (groupBy) {
        case 'day':
          return d.toISOString().slice(0, 10);
        case 'week': {
          const firstJan = new Date(d.getFullYear(), 0, 1);
          const week = Math.ceil(
            ((d.getTime() - firstJan.getTime()) / 86_400_000 +
              firstJan.getDay() +
              1) /
              7,
          );
          return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
        }
        case 'month':
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        case 'quarter':
          return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
        case 'year':
          return `${d.getFullYear()}`;
      }
    };

    const trendMap = new Map<string, number>();
    for (const s of perSession) {
      const key = bucketKey(s.sessionDate)!;
      trendMap.set(key, (trendMap.get(key) ?? 0) + s.total);
    }
    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, total]) => ({ period, total }));

    const totals = perSession.reduce(
      (acc, s) => ({
        total: acc.total + s.total,
        male: acc.male + s.male,
        female: acc.female + s.female,
        children: acc.children + s.children,
        youth: acc.youth + s.youth,
        visitors: acc.visitors + s.visitors,
        returningVisitors: acc.returningVisitors + s.returningVisitors,
      }),
      {
        total: 0,
        male: 0,
        female: 0,
        children: 0,
        youth: 0,
        visitors: 0,
        returningVisitors: 0,
      },
    );

    const sessionTotals = perSession.map((s) => s.total);

    return {
      sessionCount: sessions.length,
      totals,
      averageAttendance: sessions.length
        ? Math.round(totals.total / sessions.length)
        : 0,
      highestAttendance: sessionTotals.length ? Math.max(...sessionTotals) : 0,
      lowestAttendance: sessionTotals.length ? Math.min(...sessionTotals) : 0,
      trend,
      sessions: perSession,
    };
  }
}

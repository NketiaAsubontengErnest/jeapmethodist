import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.churchSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  }

  async getAllSettings() {
    return this.prisma.churchSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.churchSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async updateBulkSettings(dto: UpdateSettingsDto) {
    const results = [];
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        const item = await this.updateSetting(key, value);
        results.push(item);
      }
    }
    return results;
  }
}

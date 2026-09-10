import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApprovalStatus, FinancialTransactionType } from '@prisma/client';
import { Request } from 'express';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../common/constants/permissions';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly auditService: AuditService,
  ) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.FINANCE_REPORT)
  getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getFullYear(), toDate.getMonth() - 11, 1);
    return this.financeService.getSummary({ from: fromDate, to: toDate });
  }

  @Get('summary/annual')
  @RequirePermissions(PERMISSIONS.FINANCE_REPORT)
  getAnnualSummary() {
    return this.financeService.getAnnualSummary();
  }

  @Get('balance-sheet')
  @RequirePermissions(PERMISSIONS.FINANCE_REPORT)
  getBalanceSheet(@Query('asOf') asOf?: string) {
    return this.financeService.getBalanceSheet(asOf ? new Date(asOf) : new Date());
  }

  @Get('transactions/export')
  @RequirePermissions(PERMISSIONS.FINANCE_REPORT)
  @Header('Content-Type', 'text/csv')
  @Header(
    'Content-Disposition',
    'attachment; filename="financial-transactions.csv"',
  )
  exportCsv(
    @Query('type') type?: FinancialTransactionType,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.financeService.exportCsv({
      type,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('transactions')
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('type') type?: FinancialTransactionType,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('incomeCategoryId') incomeCategoryId?: string,
    @Query('expenseCategoryId') expenseCategoryId?: string,
    @Query('fundId') fundId?: string,
    @Query('financialAccountId') financialAccountId?: string,
    @Query('isReconciled') isReconciled?: string,
  ) {
    return this.financeService.findAll({
      page: parseInt(page, 10) || 1,
      pageSize: Math.min(parseInt(pageSize, 10) || 25, 100),
      type,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      incomeCategoryId,
      expenseCategoryId,
      fundId,
      financialAccountId,
      isReconciled: isReconciled !== undefined ? isReconciled === 'true' : undefined,
    });
  }

  @Get('transactions/:id')
  @RequirePermissions(PERMISSIONS.FINANCE_VIEW)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findOne(id);
  }

  @Post('transactions')
  @RequirePermissions(PERMISSIONS.FINANCE_CREATE)
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const transaction = await this.financeService.create(dto, actor.id);
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_created',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: transaction.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      newValue: {
        type: transaction.type,
        amount: transaction.amount.toString(),
      },
    });
    return transaction;
  }

  @Patch('transactions/:id')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const transaction = await this.financeService.update(id, dto);
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_updated',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return transaction;
  }

  @Delete('transactions/:id')
  @RequirePermissions(PERMISSIONS.FINANCE_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const result = await this.financeService.remove(id);
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_deleted',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return result;
  }

  @Post('transactions/:id/approve')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const transaction = await this.financeService.setApprovalStatus(
      id,
      ApprovalStatus.APPROVED,
      actor.id,
    );
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_approved',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return transaction;
  }

  @Post('transactions/:id/reject')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const transaction = await this.financeService.setApprovalStatus(
      id,
      ApprovalStatus.REJECTED,
      actor.id,
    );
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_rejected',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return transaction;
  }

  @Post('transactions/:id/reconcile')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  async reconcile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const transaction = await this.financeService.setReconciled(id, true, actor.id);
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_reconciled',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return transaction;
  }

  @Post('transactions/:id/unreconcile')
  @RequirePermissions(PERMISSIONS.FINANCE_UPDATE)
  async unreconcile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const transaction = await this.financeService.setReconciled(id, false, actor.id);
    await this.auditService.record({
      userId: actor.id,
      action: 'finance.transaction_unreconciled',
      module: 'finance',
      entityType: 'FinancialTransaction',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return transaction;
  }
}

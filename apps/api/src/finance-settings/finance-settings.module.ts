import { Module } from '@nestjs/common';
import { IncomeCategoriesService } from './income-categories.service';
import { IncomeCategoriesController } from './income-categories.controller';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { FinancialAccountsService } from './financial-accounts.service';
import { FinancialAccountsController } from './financial-accounts.controller';

@Module({
  controllers: [
    IncomeCategoriesController,
    ExpenseCategoriesController,
    FinancialAccountsController,
  ],
  providers: [
    IncomeCategoriesService,
    ExpenseCategoriesService,
    FinancialAccountsService,
  ],
  exports: [
    IncomeCategoriesService,
    ExpenseCategoriesService,
    FinancialAccountsService,
  ],
})
export class FinanceSettingsModule {}

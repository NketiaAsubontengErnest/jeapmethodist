'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HandCoins, Loader2, Plus, Search, User, UserX } from 'lucide-react';
import {
  fetchTransactions,
  createTransaction,
  fetchIncomeCategories,
  type TransactionListItem,
} from '@/lib/api/finance';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MemberCombobox } from '@/components/ui/member-combobox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const tithSchema = z.object({
  payerType: z.enum(['MEMBER', 'NON_MEMBER']),
  donorMemberId: z.string().optional(),
  donorName: z.string().optional(),
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
  description: z.string().optional(),
});
type TitheFormValues = z.infer<typeof tithSchema>;

function formatCurrency(amount: string | number) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);
}

export default function TithesPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMemberLabel, setSelectedMemberLabel] = useState<string | undefined>(undefined);

  const canView = hasPermission('finance.view');
  const canCreate = hasPermission('finance.create');

  const categoriesQuery = useQuery({ queryKey: ['income-categories'], queryFn: fetchIncomeCategories });
  const titheCategory = categoriesQuery.data?.find((c) => c.name.toLowerCase() === 'tithe');

  const transactionsQuery = useQuery({
    queryKey: ['tithes', titheCategory?.id],
    queryFn: () => fetchTransactions({ type: 'INCOME', incomeCategoryId: titheCategory!.id, pageSize: 50 }),
    enabled: canView && !!titheCategory,
  });

  const { register, handleSubmit, watch, setValue, reset, formState } = useForm<TitheFormValues>({
    resolver: zodResolver(tithSchema),
    defaultValues: { payerType: 'MEMBER', date: new Date().toISOString().slice(0, 10) },
  });
  const payerType = watch('payerType');

  const createMutation = useMutation({
    mutationFn: (values: TitheFormValues) =>
      createTransaction({
        type: 'INCOME',
        incomeCategoryId: titheCategory!.id,
        amount: values.amount,
        date: values.date,
        reference: values.reference,
        description: values.description,
        donorMemberId: values.payerType === 'MEMBER' ? values.donorMemberId : undefined,
        donorName: values.payerType === 'NON_MEMBER' ? values.donorName : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tithes'] });
      setOpen(false);
      reset({ payerType: 'MEMBER', date: new Date().toISOString().slice(0, 10) });
      setFormError(null);
      setSelectedMemberLabel(undefined);
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Failed to record tithe'),
  });

  const total = useMemo(
    () => transactionsQuery.data?.items.reduce((sum, t) => sum + parseFloat(t.amount), 0) ?? 0,
    [transactionsQuery.data],
  );

  const visibleTithes = useMemo(() => {
    const items = transactionsQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      const payer = t.donorMember ? `${t.donorMember.firstName} ${t.donorMember.lastName}` : t.donorName ?? '';
      return payer.toLowerCase().includes(q) || (t.reference ?? '').toLowerCase().includes(q);
    });
  }, [transactionsQuery.data, search]);

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Tithes</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You don&apos;t have permission to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Tithes</h1>
          <p className="text-muted-foreground">Record tithes by registered member, or by name for a non-member giver</p>
        </div>
        {canCreate && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button disabled={!titheCategory} className="print:hidden">
                <Plus className="h-4 w-4" /> Record tithe
              </Button>
            </SheetTrigger>
            <SheetContent>
              <form
                onSubmit={handleSubmit((values) => {
                  setFormError(null);
                  createMutation.mutate(values);
                })}
                className="flex h-full flex-col"
                noValidate
              >
                <SheetHeader>
                  <SheetTitle>Record a tithe</SheetTitle>
                  <SheetDescription>Link this tithe to a registered member, or record it by name for a non-member.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setValue('payerType', 'MEMBER')}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        payerType === 'MEMBER' ? 'border-primary bg-secondary text-primary' : 'border-input text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <User className="h-4 w-4" /> Registered Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('payerType', 'NON_MEMBER')}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        payerType === 'NON_MEMBER' ? 'border-primary bg-secondary text-primary' : 'border-input text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <UserX className="h-4 w-4" /> Non-member
                    </button>
                  </div>

                  {payerType === 'MEMBER' ? (
                    <div className="space-y-2">
                      <Label htmlFor="donorMemberId">Member</Label>
                      <MemberCombobox
                        id="donorMemberId"
                        value={watch('donorMemberId')}
                        selectedLabel={selectedMemberLabel}
                        onSelect={(member) => {
                          setValue('donorMemberId', member.id);
                          setSelectedMemberLabel(`${member.firstName} ${member.lastName} (${member.membershipNumber})`);
                        }}
                        onClear={() => {
                          setValue('donorMemberId', undefined);
                          setSelectedMemberLabel(undefined);
                        }}
                        placeholder="Search member by name…"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="donorName">Giver&apos;s name</Label>
                      <Input id="donorName" placeholder="e.g. Kwame Mensah (visitor)" {...register('donorName')} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (GHS)</Label>
                      <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
                      {formState.errors.amount && <p className="text-sm text-destructive">{formState.errors.amount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" {...register('date')} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference (optional)</Label>
                    <Input id="reference" placeholder="Receipt / MoMo reference" {...register('reference')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Notes (optional)</Label>
                    <Input id="description" placeholder="Any additional notes" {...register('description')} />
                  </div>

                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Saving…' : 'Save tithe'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <HandCoins className="h-4 w-4 text-primary" /> Recorded Tithes
            </CardTitle>
            <CardDescription>Most recent 50 tithe transactions</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total shown</p>
              <p className="font-serif text-lg font-bold text-primary">{formatCurrency(total)}</p>
            </div>
            <ListActions
              onExport={() =>
                exportToCsv('tithes', visibleTithes, [
                  { header: 'Date', accessor: (t) => new Date(t.date).toLocaleDateString() },
                  {
                    header: 'Payer',
                    accessor: (t) => (t.donorMember ? `${t.donorMember.firstName} ${t.donorMember.lastName}` : t.donorName ?? 'Anonymous'),
                  },
                  { header: 'Amount (GHS)', accessor: (t) => t.amount },
                  { header: 'Reference', accessor: (t) => t.reference ?? '' },
                  { header: 'Recorded By', accessor: (t) => (t.recordedByUser ? `${t.recordedByUser.firstName} ${t.recordedByUser.lastName}` : '') },
                ])
              }
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-xs print:hidden">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by payer or reference…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {transactionsQuery.isLoading || categoriesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading tithes…
            </div>
          ) : !titheCategory ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No &quot;Tithe&quot; income category found — check Settings &rarr; Income Categories.
            </p>
          ) : visibleTithes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No tithes match your search.' : 'No tithes recorded yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Recorded by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTithes.map((t: TransactionListItem) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">
                      {t.donorMember ? (
                        `${t.donorMember.firstName} ${t.donorMember.lastName}`
                      ) : t.donorName ? (
                        <span className="flex items-center gap-1.5">
                          {t.donorName} <Badge variant="secondary">Non-member</Badge>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(t.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{t.reference ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.recordedByUser ? `${t.recordedByUser.firstName} ${t.recordedByUser.lastName}` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

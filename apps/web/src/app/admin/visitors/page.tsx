'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, PhoneCall, UserCheck, Pencil, Trash2 } from 'lucide-react';
import {
  fetchVisitors,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  addFollowUp,
  convertVisitor,
  FOLLOW_UP_STATUS_LABELS,
  type VisitorListItem,
  type VisitorFollowUpStatus,
} from '@/lib/api/visitors';
import { fetchMemberCategories, fetchMembershipStatuses } from '@/lib/api/members';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const createVisitorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateVisited: z.string().min(1, 'Date visited is required'),
  howHeard: z.string().optional(),
  interestedInJoining: z.boolean().optional(),
});

type CreateVisitorValues = z.infer<typeof createVisitorSchema>;

const followUpSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'FOLLOW_UP_SCHEDULED', 'INTERESTED', 'JOINED', 'NOT_INTERESTED', 'COULD_NOT_REACH']),
  notes: z.string().optional(),
});
type FollowUpValues = z.infer<typeof followUpSchema>;

const convertSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE']),
  membershipStatusId: z.string().min(1),
  memberCategoryId: z.string().min(1),
});
type ConvertValues = z.infer<typeof convertSchema>;

function statusVariant(status: VisitorFollowUpStatus) {
  if (status === 'JOINED' || status === 'INTERESTED') return 'success' as const;
  if (status === 'NOT_INTERESTED' || status === 'COULD_NOT_REACH') return 'destructive' as const;
  return 'secondary' as const;
}

export default function VisitorsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editVisitor, setEditVisitor] = useState<VisitorListItem | null>(null);
  const [followUpVisitor, setFollowUpVisitor] = useState<VisitorListItem | null>(null);
  const [convertVisitorTarget, setConvertVisitorTarget] = useState<VisitorListItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const visitorsQuery = useQuery({
    queryKey: ['visitors', page, search],
    queryFn: () => fetchVisitors({ page, search: search || undefined }),
  });
  const categoriesQuery = useQuery({ queryKey: ['member-categories'], queryFn: fetchMemberCategories });
  const statusesQuery = useQuery({ queryKey: ['membership-statuses'], queryFn: fetchMembershipStatuses });

  const createForm = useForm<CreateVisitorValues>({ resolver: zodResolver(createVisitorSchema) });
  const editForm = useForm<CreateVisitorValues>({ resolver: zodResolver(createVisitorSchema) });
  const followUpForm = useForm<FollowUpValues>({ resolver: zodResolver(followUpSchema) });
  const convertForm = useForm<ConvertValues>({ resolver: zodResolver(convertSchema) });

  const createMutation = useMutation({
    mutationFn: createVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      setCreateOpen(false);
      createForm.reset();
      toast.success('Visitor recorded!');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to record visitor';
      setFormError(message);
      toast.error('Failed to record visitor', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateVisitorValues) => updateVisitor(editVisitor!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      setEditVisitor(null);
      editForm.reset();
      toast.success('Visitor updated!');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to update visitor';
      setFormError(message);
      toast.error('Failed to update visitor', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast.success('Visitor deleted');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete visitor';
      setFormError(message);
      toast.error('Failed to delete visitor', message);
    },
  });

  const followUpMutation = useMutation({
    mutationFn: (values: FollowUpValues) => addFollowUp(followUpVisitor!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      setFollowUpVisitor(null);
      followUpForm.reset();
      toast.success('Follow-up recorded!');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to record follow-up';
      setFormError(message);
      toast.error('Failed to record follow-up', message);
    },
  });

  const convertMutation = useMutation({
    mutationFn: (values: ConvertValues) => convertVisitor(convertVisitorTarget!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setConvertVisitorTarget(null);
      convertForm.reset();
      toast.success('Visitor converted to member!');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to convert visitor';
      setFormError(message);
      toast.error('Failed to convert visitor', message);
    },
  });

  const canCreate = hasPermission('visitor.create');
  const canUpdate = hasPermission('visitor.update');
  const canDelete = hasPermission('visitor.delete');
  const canCreateMember = hasPermission('member.create');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: VisitorListItem[] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchVisitors({ page: currentPage, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('visitors', all, [
        { header: 'First Name', accessor: (v) => v.firstName },
        { header: 'Last Name', accessor: (v) => v.lastName },
        { header: 'Phone', accessor: (v) => v.phone ?? '' },
        { header: 'Email', accessor: (v) => v.email ?? '' },
        { header: 'Date Visited', accessor: (v) => new Date(v.dateVisited).toLocaleDateString() },
        { header: 'Follow-up Status', accessor: (v) => FOLLOW_UP_STATUS_LABELS[v.followUpStatus] },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  const openEditModal = (v: VisitorListItem) => {
    setFormError(null);
    setEditVisitor(v);
    editForm.reset({
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone ?? '',
      dateVisited: v.dateVisited.slice(0, 10),
      howHeard: '',
      interestedInJoining: v.interestedInJoining,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visitors</h1>
          <p className="text-muted-foreground">First-time and returning guests, and their follow-up status</p>
        </div>

        {canCreate && (
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <Button className="print:hidden">
                <Plus className="h-4 w-4" />
                Record visitor
              </Button>
            </SheetTrigger>
            <SheetContent>
              <form
                onSubmit={createForm.handleSubmit((values) => {
                  setFormError(null);
                  createMutation.mutate(values);
                })}
                className="flex h-full flex-col"
                noValidate
              >
                <SheetHeader>
                  <SheetTitle>Record a visitor</SheetTitle>
                  <SheetDescription>Creates a follow-up task for the assigned team.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="v-firstName">First name</Label>
                    <Input id="v-firstName" {...createForm.register('firstName')} />
                    {createForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{createForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-lastName">Last name</Label>
                    <Input id="v-lastName" {...createForm.register('lastName')} />
                    {createForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{createForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="v-phone">Phone</Label>
                    <Input id="v-phone" placeholder="+233…" {...createForm.register('phone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-dateVisited">Date visited</Label>
                    <Input id="v-dateVisited" type="date" {...createForm.register('dateVisited')} />
                    {createForm.formState.errors.dateVisited && (
                      <p className="text-sm text-destructive">{createForm.formState.errors.dateVisited.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-howHeard">How did they hear about us?</Label>
                  <Input id="v-howHeard" {...createForm.register('howHeard')} />
                </div>
                {formError && (
                  <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </p>
                )}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Saving…' : 'Save visitor'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {visitorsQuery.data ? `${visitorsQuery.data.total} visitor${visitorsQuery.data.total === 1 ? '' : 's'}` : 'Visitors'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email…"
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <ListActions
              onExport={handleExport}
              exportDisabled={isExporting}
              exportLabel={isExporting ? 'Exporting…' : 'Export CSV'}
            />
          </div>
        </CardHeader>
        <CardContent>
          {visitorsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading visitors…
            </div>
          ) : visitorsQuery.isError ? (
            <p className="py-8 text-center text-sm text-destructive">Failed to load visitors.</p>
          ) : visitorsQuery.data && visitorsQuery.data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No visitors recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date visited</TableHead>
                  <TableHead>Follow-up status</TableHead>
                  {(canUpdate || canCreateMember) && <TableHead className="text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitorsQuery.data?.items.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">
                      {visitor.firstName} {visitor.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{visitor.phone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(visitor.dateVisited).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(visitor.followUpStatus)}>
                        {FOLLOW_UP_STATUS_LABELS[visitor.followUpStatus]}
                      </Badge>
                    </TableCell>
                    {(canUpdate || canDelete || canCreateMember) && (
                      <TableCell className="space-x-1 text-right print:hidden">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit visitor"
                            onClick={() => openEditModal(visitor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canUpdate && visitor.followUpStatus !== 'JOINED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormError(null);
                              setFollowUpVisitor(visitor);
                            }}
                          >
                            <PhoneCall className="h-4 w-4" />
                            Follow up
                          </Button>
                        )}
                        {canCreateMember && visitor.followUpStatus !== 'JOINED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormError(null);
                              setConvertVisitorTarget(visitor);
                            }}
                          >
                            <UserCheck className="h-4 w-4" />
                            Convert
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete visitor"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${visitor.firstName} ${visitor.lastName}?`)) {
                                deleteMutation.mutate(visitor.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {visitorsQuery.data && visitorsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {visitorsQuery.data.page} of {visitorsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= visitorsQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up sheet */}
      <Sheet open={!!followUpVisitor} onOpenChange={(open: boolean) => !open && setFollowUpVisitor(null)}>
        <SheetContent>
          <form
            onSubmit={followUpForm.handleSubmit((values) => {
              setFormError(null);
              followUpMutation.mutate(values);
            })}
            className="flex h-full flex-col"
            noValidate
          >
            <SheetHeader>
              <SheetTitle>Log a follow-up</SheetTitle>
              <SheetDescription>
                {followUpVisitor && `${followUpVisitor.firstName} ${followUpVisitor.lastName}`}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fu-status">Status</Label>
              <Controller
                control={followUpForm.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="fu-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FOLLOW_UP_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fu-notes">Notes</Label>
              <Input id="fu-notes" {...followUpForm.register('notes')} />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={followUpMutation.isPending}>
                {followUpMutation.isPending ? 'Saving…' : 'Save follow-up'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Convert to member sheet */}
      <Sheet open={!!convertVisitorTarget} onOpenChange={(open: boolean) => !open && setConvertVisitorTarget(null)}>
        <SheetContent>
          <form
            onSubmit={convertForm.handleSubmit((values) => {
              setFormError(null);
              convertMutation.mutate(values);
            })}
            className="flex h-full flex-col"
            noValidate
          >
            <SheetHeader>
              <SheetTitle>Convert to member</SheetTitle>
              <SheetDescription>
                {convertVisitorTarget && `${convertVisitorTarget.firstName} ${convertVisitorTarget.lastName}`} will get
                a full member record.
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-gender">Gender</Label>
              <Controller
                control={convertForm.control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="cv-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cv-category">Member category</Label>
              <Controller
                control={convertForm.control}
                name="memberCategoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="cv-category">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesQuery.data?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cv-status">Membership status</Label>
              <Controller
                control={convertForm.control}
                name="membershipStatusId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="cv-status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusesQuery.data?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={convertMutation.isPending}>
                {convertMutation.isPending ? 'Converting…' : 'Convert to member'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit visitor sheet */}
      <Sheet open={!!editVisitor} onOpenChange={(open: boolean) => !open && setEditVisitor(null)}>
        <SheetContent>
          <form
            onSubmit={editForm.handleSubmit((values) => {
              setFormError(null);
              updateMutation.mutate(values);
            })}
            className="flex h-full flex-col"
            noValidate
          >
            <SheetHeader>
              <SheetTitle>Edit visitor details</SheetTitle>
              <SheetDescription>
                {editVisitor && `${editVisitor.firstName} ${editVisitor.lastName}`}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ve-firstName">First name</Label>
                  <Input id="ve-firstName" {...editForm.register('firstName')} />
                  {editForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ve-lastName">Last name</Label>
                  <Input id="ve-lastName" {...editForm.register('lastName')} />
                  {editForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ve-phone">Phone</Label>
                  <Input id="ve-phone" placeholder="+233…" {...editForm.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ve-dateVisited">Date visited</Label>
                  <Input id="ve-dateVisited" type="date" {...editForm.register('dateVisited')} />
                  {editForm.formState.errors.dateVisited && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.dateVisited.message}</p>
                  )}
                </div>
              </div>
              {formError && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Check, Eye, Loader2, Pencil, Plus, Search, Users } from 'lucide-react';
import {
  fetchMembers,
  fetchMemberCategories,
  fetchMembershipStatuses,
  createMember,
  updateMember,
  type MemberListItem,
} from '@/lib/api/members';
import { fetchGroups } from '@/lib/api/groups';
import { fetchMinistries } from '@/lib/api/ministries';
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
import { cn } from '@/lib/utils';

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  membershipStatusId: z.string().min(1, 'Select a status'),
  memberCategoryId: z.string().min(1, 'Select a category'),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MembersPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // New Member Modal State
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newGroupIds, setNewGroupIds] = useState<string[]>([]);
  const [newMinistryIds, setNewMinistryIds] = useState<string[]>([]);
  const [newFormError, setNewFormError] = useState<string | null>(null);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<MemberListItem | null>(null);
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);
  const [editMinistryIds, setEditMinistryIds] = useState<string[]>([]);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const membersQuery = useQuery({
    queryKey: ['members', page, search],
    queryFn: () => fetchMembers({ page, search: search || undefined }),
  });
  const categoriesQuery = useQuery({ queryKey: ['member-categories'], queryFn: fetchMemberCategories });
  const statusesQuery = useQuery({ queryKey: ['membership-statuses'], queryFn: fetchMembershipStatuses });
  const groupsQuery = useQuery({ queryKey: ['groups'], queryFn: fetchGroups });
  const ministriesQuery = useQuery({ queryKey: ['ministries'], queryFn: fetchMinistries });

  const newForm = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema) });
  const editForm = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema) });

  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member registered successfully!');
      setNewDialogOpen(false);
      newForm.reset();
      setNewGroupIds([]);
      setNewMinistryIds([]);
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to create member';
      setNewFormError(message);
      toast.error('Failed to register member', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: MemberFormValues }) =>
      updateMember(data.id, {
        ...data.values,
        email: data.values.email || undefined,
        groupIds: editGroupIds,
        ministryIds: editMinistryIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member updated successfully!');
      setEditingMember(null);
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to update member';
      setEditFormError(message);
      toast.error('Failed to update member', message);
    },
  });

  const canCreate = hasPermission('member.create');
  const canUpdate = hasPermission('member.update');

  const onNewSubmit = (values: MemberFormValues) => {
    setNewFormError(null);
    createMutation.mutate({
      ...values,
      email: values.email || undefined,
      groupIds: newGroupIds,
      ministryIds: newMinistryIds,
    });
  };

  const onEditSubmit = (values: MemberFormValues) => {
    if (!editingMember) return;
    setEditFormError(null);
    updateMutation.mutate({ id: editingMember.id, values });
  };

  const openEditSheet = (member: MemberListItem) => {
    setEditingMember(member);
    setEditFormError(null);
    editForm.reset({
      firstName: member.firstName,
      lastName: member.lastName,
      gender: member.gender,
      phone: member.phone || '',
      email: member.email || '',
      memberCategoryId: member.memberCategory.id,
      membershipStatusId: member.membershipStatus.id,
    });
    setEditGroupIds(member.groupMemberships?.map((g) => g.group.id) ?? []);
    setEditMinistryIds(member.ministryMemberships?.map((m) => m.ministry.id) ?? []);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: MemberListItem[] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchMembers({ page: currentPage, pageSize: 100, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('members', all, [
        { header: 'Membership No.', accessor: (m) => m.membershipNumber },
        { header: 'First Name', accessor: (m) => m.firstName },
        { header: 'Last Name', accessor: (m) => m.lastName },
        { header: 'Gender', accessor: (m) => m.gender },
        { header: 'Category', accessor: (m) => m.memberCategory.name },
        { header: 'Status', accessor: (m) => m.membershipStatus.name },
        { header: 'Phone', accessor: (m) => m.phone ?? '' },
        { header: 'Email', accessor: (m) => m.email ?? '' },
        { header: 'Active', accessor: (m) => (m.isActive ? 'Yes' : 'No') },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Church membership records</p>
        </div>

        {canCreate && (
          <Sheet open={newDialogOpen} onOpenChange={(val: boolean) => setNewDialogOpen(val)}>
            <SheetTrigger asChild>
              <Button className="print:hidden">
                <Plus className="h-4 w-4" />
                New member
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <form onSubmit={newForm.handleSubmit(onNewSubmit)} className="flex h-full flex-col" noValidate>
                <SheetHeader>
                  <SheetTitle>Register a new member</SheetTitle>
                  <SheetDescription>
                    A membership number is generated automatically. You can assign groups and ministries immediately.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="new-firstName">First name *</Label>
                      <Input id="new-firstName" {...newForm.register('firstName')} />
                      {newForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive">{newForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-lastName">Last name *</Label>
                      <Input id="new-lastName" {...newForm.register('lastName')} />
                      {newForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive">{newForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-gender">Gender *</Label>
                    <Controller
                      control={newForm.control}
                      name="gender"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="new-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="MALE">Male</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {newForm.formState.errors.gender && (
                      <p className="text-sm text-destructive">{newForm.formState.errors.gender.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="new-phone">Phone</Label>
                      <Input id="new-phone" placeholder="+233…" {...newForm.register('phone')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-email">Email</Label>
                      <Input id="new-email" type="email" {...newForm.register('email')} />
                      {newForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{newForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="new-memberCategoryId">Category *</Label>
                      <Controller
                        control={newForm.control}
                        name="memberCategoryId"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="new-memberCategoryId">
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
                      {newForm.formState.errors.memberCategoryId && (
                        <p className="text-sm text-destructive">{newForm.formState.errors.memberCategoryId.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-membershipStatusId">Status *</Label>
                      <Controller
                        control={newForm.control}
                        name="membershipStatusId"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="new-membershipStatusId">
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
                      {newForm.formState.errors.membershipStatusId && (
                        <p className="text-sm text-destructive">{newForm.formState.errors.membershipStatusId.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Multiple Groups Selector */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" /> Assign Groups ({newGroupIds.length})
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-md bg-muted/20">
                      {groupsQuery.data?.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No groups available</p>
                      ) : (
                        groupsQuery.data?.map((group) => {
                          const isSelected = newGroupIds.includes(group.id);
                          return (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() =>
                                setNewGroupIds((prev) =>
                                  prev.includes(group.id) ? prev.filter((id) => id !== group.id) : [...prev, group.id]
                                )
                              }
                              className={cn(
                                'flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md border transition-all text-left',
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background hover:bg-muted text-foreground'
                              )}
                            >
                              <span>{group.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Multiple Ministries Selector */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" /> Assign Ministries ({newMinistryIds.length})
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-md bg-muted/20">
                      {ministriesQuery.data?.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No ministries available</p>
                      ) : (
                        ministriesQuery.data?.map((ministry) => {
                          const isSelected = newMinistryIds.includes(ministry.id);
                          return (
                            <button
                              key={ministry.id}
                              type="button"
                              onClick={() =>
                                setNewMinistryIds((prev) =>
                                  prev.includes(ministry.id)
                                    ? prev.filter((id) => id !== ministry.id)
                                    : [...prev, ministry.id]
                                )
                              }
                              className={cn(
                                'flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md border transition-all text-left',
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background hover:bg-muted text-foreground'
                              )}
                            >
                              <span>{ministry.name}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {newFormError && (
                    <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {newFormError}
                    </p>
                  )}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={newForm.formState.isSubmitting || createMutation.isPending}>
                    {createMutation.isPending ? 'Creating…' : 'Create member'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Edit Member Sheet */}
      <Sheet open={!!editingMember} onOpenChange={(val: boolean) => !val && setEditingMember(null)}>
        <SheetContent className="sm:max-w-md">
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex h-full flex-col" noValidate>
            <SheetHeader>
              <SheetTitle>Edit Member</SheetTitle>
              <SheetDescription>
                Update details, groups, and ministries for {editingMember?.firstName} {editingMember?.lastName}.
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First name *</Label>
                  <Input id="edit-firstName" {...editForm.register('firstName')} />
                  {editForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last name *</Label>
                  <Input id="edit-lastName" {...editForm.register('lastName')} />
                  {editForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender *</Label>
                <Controller
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {editForm.formState.errors.gender && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.gender.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" placeholder="+233…" {...editForm.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" {...editForm.register('email')} />
                  {editForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-memberCategoryId">Category *</Label>
                  <Controller
                    control={editForm.control}
                    name="memberCategoryId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="edit-memberCategoryId">
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
                  {editForm.formState.errors.memberCategoryId && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.memberCategoryId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-membershipStatusId">Status *</Label>
                  <Controller
                    control={editForm.control}
                    name="membershipStatusId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="edit-membershipStatusId">
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
                  {editForm.formState.errors.membershipStatusId && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.membershipStatusId.message}</p>
                  )}
                </div>
              </div>

              {/* Multiple Groups Selector */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" /> Assign Groups ({editGroupIds.length})
                  </Label>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-md bg-muted/20">
                  {groupsQuery.data?.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-1">No groups available</p>
                  ) : (
                    groupsQuery.data?.map((group) => {
                      const isSelected = editGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() =>
                            setEditGroupIds((prev) =>
                              prev.includes(group.id) ? prev.filter((id) => id !== group.id) : [...prev, group.id]
                            )
                          }
                          className={cn(
                            'flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md border transition-all text-left',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background hover:bg-muted text-foreground'
                          )}
                        >
                          <span>{group.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Multiple Ministries Selector */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Assign Ministries ({editMinistryIds.length})
                  </Label>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-md bg-muted/20">
                  {ministriesQuery.data?.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-1">No ministries available</p>
                  ) : (
                    ministriesQuery.data?.map((ministry) => {
                      const isSelected = editMinistryIds.includes(ministry.id);
                      return (
                        <button
                          key={ministry.id}
                          type="button"
                          onClick={() =>
                            setEditMinistryIds((prev) =>
                              prev.includes(ministry.id)
                                ? prev.filter((id) => id !== ministry.id)
                                : [...prev, ministry.id]
                            )
                          }
                          className={cn(
                            'flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md border transition-all text-left',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background hover:bg-muted text-foreground'
                          )}
                        >
                          <span>{ministry.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {editFormError && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {editFormError}
                </p>
              )}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={editForm.formState.isSubmitting || updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {membersQuery.data ? `${membersQuery.data.total} member${membersQuery.data.total === 1 ? '' : 's'}` : 'Members'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, number, phone…"
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <ListActions onExport={handleExport} exportDisabled={isExporting} exportLabel={isExporting ? 'Exporting…' : 'Export CSV'} />
          </div>
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading members…
            </div>
          ) : membersQuery.isError ? (
            <p className="py-8 text-center text-sm text-destructive">Failed to load members. Please try again.</p>
          ) : membersQuery.data && membersQuery.data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No members match your search.' : 'No members registered yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Groups &amp; Ministries</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersQuery.data?.items.map((member) => {
                  const groupsCount = member.groupMemberships?.length ?? 0;
                  const ministriesCount = member.ministryMemberships?.length ?? 0;

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {member.membershipNumber}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/members/${member.id}`} className="font-medium hover:underline">
                          {member.firstName} {member.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{member.memberCategory.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? 'success' : 'destructive'}>
                          {member.membershipStatus.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          {groupsCount === 0 && ministriesCount === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <>
                              {groupsCount > 0 && (
                                <Badge variant="outline" className="text-[11px] gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200">
                                  <Users className="h-3 w-3" />
                                  {groupsCount} {groupsCount === 1 ? 'Group' : 'Groups'}
                                </Badge>
                              )}
                              {ministriesCount > 0 && (
                                <Badge variant="outline" className="text-[11px] gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200">
                                  <Building2 className="h-3 w-3" />
                                  {ministriesCount} {ministriesCount === 1 ? 'Ministry' : 'Ministries'}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.phone ?? '—'}</TableCell>
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View Profile">
                            <Link href={`/admin/members/${member.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditSheet(member)}
                              title="Edit Member"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {membersQuery.data && membersQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {membersQuery.data.page} of {membersQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= membersQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, UserMinus, Users2 } from 'lucide-react';
import {
  fetchFamilies,
  fetchFamily,
  createFamily,
  addFamilyMember,
  removeFamilyMember,
  type FamilyListItem,
  type FamilyRole,
} from '@/lib/api/families';
import { fetchMembers } from '@/lib/api/members';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
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

const createFamilySchema = z.object({
  name: z.string().min(1, 'Family name is required'),
  familyPhone: z.string().optional(),
  familyAddress: z.string().optional(),
});
type CreateFamilyValues = z.infer<typeof createFamilySchema>;

const addMemberSchema = z.object({
  memberId: z.string().min(1, 'Select a member'),
  role: z.enum(['HEAD', 'SPOUSE', 'CHILD', 'DEPENDANT', 'OTHER']),
});
type AddMemberValues = z.infer<typeof addMemberSchema>;

const ROLE_LABELS: Record<FamilyRole, string> = {
  HEAD: 'Head',
  SPOUSE: 'Spouse',
  CHILD: 'Child',
  DEPENDANT: 'Dependant',
  OTHER: 'Other',
};

function FamilyDetailDialog({
  familyId,
  onClose,
  canManage,
}: {
  familyId: string;
  onClose: () => void;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const familyQuery = useQuery({ queryKey: ['families', familyId], queryFn: () => fetchFamily(familyId) });
  const membersQuery = useQuery({ queryKey: ['members', 'all-for-family'], queryFn: () => fetchMembers({ pageSize: 100 }) });
  const [error, setError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');

  const { control, handleSubmit, reset } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
  });

  const addMutation = useMutation({
    mutationFn: (values: AddMemberValues) => addFamilyMember(familyId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      reset();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to add member'),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeFamilyMember(familyId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['families'] }),
  });

  const family = familyQuery.data;
  const existingIds = new Set(family?.members.map((m) => m.member.id));
  const availableMembers = membersQuery.data?.items.filter((m) => !existingIds.has(m.id)) ?? [];

  const visibleMembers = useMemo(() => {
    const members = family?.members ?? [];
    if (!memberSearch.trim()) return members;
    const q = memberSearch.trim().toLowerCase();
    return members.filter((m) => {
      const name = `${m.member.firstName} ${m.member.lastName}`;
      return name.toLowerCase().includes(q) || ROLE_LABELS[m.role].toLowerCase().includes(q);
    });
  }, [family, memberSearch]);

  return (
    <Sheet open onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{family?.name ?? 'Family'}</SheetTitle>
          <SheetDescription>{family?.familyPhone ?? 'No family phone on file'}</SheetDescription>
        </SheetHeader>

        {familyQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SheetBody className="space-y-4">
            {family && family.members.length > 0 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name or role…"
                  className="pl-8"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              {visibleMembers.map((m) => (
                <div key={m.member.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {m.member.firstName} {m.member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[m.role]}</p>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(m.member.id)}
                      disabled={removeMutation.isPending}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {family?.members.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No members added yet.</p>
              )}
              {family && family.members.length > 0 && visibleMembers.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No members match your search.</p>
              )}
            </div>

            {canManage && (
              <form
                onSubmit={handleSubmit((values) => {
                  setError(null);
                  addMutation.mutate(values);
                })}
                className="flex items-end gap-2 border-t border-border pt-4"
              >
                <div className="flex-1 space-y-2">
                  <Label htmlFor="add-member">Add member</Label>
                  <Controller
                    control={control}
                    name="memberId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="add-member">
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.firstName} {m.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor="add-role">Role</Label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="add-role">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button type="submit" size="sm" disabled={addMutation.isPending}>
                  Add
                </Button>
              </form>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </SheetBody>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function FamiliesPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyListItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const familiesQuery = useQuery({ queryKey: ['families', page], queryFn: () => fetchFamilies({ page }) });

  const visibleFamilies = useMemo(() => {
    const items = familiesQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((family) => {
      return family.name.toLowerCase().includes(q) || (family.familyPhone ?? '').toLowerCase().includes(q);
    });
  }, [familiesQuery.data, search]);

  const { register, handleSubmit, reset, formState } = useForm<CreateFamilyValues>({
    resolver: zodResolver(createFamilySchema),
  });

  const createMutation = useMutation({
    mutationFn: createFamily,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setCreateOpen(false);
      reset();
    },
    onError: (e) => setFormError(e instanceof ApiError ? e.message : 'Failed to create family'),
  });

  const canCreate = hasPermission('member.create');
  const canManage = hasPermission('member.update');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Families</h1>
          <p className="text-muted-foreground">Group members into households for a shared profile</p>
        </div>

        {canCreate && (
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <Button className="print:hidden">
                <Plus className="h-4 w-4" />
                New family
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
                  <SheetTitle>Create a family</SheetTitle>
                  <SheetDescription>Add members to it afterwards from the family profile.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="f-name">Family name</Label>
                    <Input id="f-name" placeholder="The Mensah Family" {...register('name')} />
                    {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="f-phone">Family phone</Label>
                    <Input id="f-phone" placeholder="+233…" {...register('familyPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="f-address">Family address</Label>
                    <Input id="f-address" {...register('familyAddress')} />
                  </div>
                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating…' : 'Create family'}
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
            {familiesQuery.data ? `${familiesQuery.data.total} famil${familiesQuery.data.total === 1 ? 'y' : 'ies'}` : 'Families'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ListActions
              onExport={() =>
                exportToCsv('families', visibleFamilies, [
                  { header: 'Family Name', accessor: (f) => f.name },
                  { header: 'Phone', accessor: (f) => f.familyPhone ?? '' },
                  { header: 'Members', accessor: (f) => f._count.members },
                ])
              }
              exportDisabled={visibleFamilies.length === 0}
            />
          </div>
        </CardHeader>
        <CardContent>
          {familiesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading families…
            </div>
          ) : visibleFamilies.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No families match your search.' : 'No families created yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="print:hidden" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleFamilies.map((family) => (
                  <TableRow key={family.id} className="cursor-pointer" onClick={() => setSelectedFamily(family)}>
                    <TableCell className="font-medium">{family.name}</TableCell>
                    <TableCell className="text-muted-foreground">{family.familyPhone ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users2 className="mr-1 h-3 w-3" />
                        {family._count.members}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground print:hidden">View →</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {familiesQuery.data && familiesQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {familiesQuery.data.page} of {familiesQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= familiesQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFamily && (
        <FamilyDetailDialog familyId={selectedFamily.id} onClose={() => setSelectedFamily(null)} canManage={canManage} />
      )}
    </div>
  );
}

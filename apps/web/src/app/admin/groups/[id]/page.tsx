'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Calendar,
  MapPin,
  UserCheck,
  Search,
} from 'lucide-react';
import {
  fetchGroup,
  updateGroup,
  addGroupMember,
  removeGroupMember,
} from '@/lib/api/groups';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { MemberCombobox } from '@/components/ui/member-combobox';

const addMemberSchema = z.object({
  memberId: z.string().min(1, 'Please select a member'),
  roleInGroup: z.string().optional(),
});
type AddMemberValues = z.infer<typeof addMemberSchema>;

const editGroupSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  meetingSchedule: z.string().optional(),
  meetingVenue: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().or(z.literal('')).optional(),
  leaderMemberId: z.string().optional(),
  assistantLeaderMemberId: z.string().optional(),
});
type EditGroupValues = z.infer<typeof editGroupSchema>;

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [addMemberLabel, setAddMemberLabel] = useState<string | undefined>(undefined);
  const [editLeaderLabel, setEditLeaderLabel] = useState<string | undefined>(undefined);
  const [rosterSearch, setRosterSearch] = useState('');

  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['group', id],
    queryFn: () => fetchGroup(id),
  });

  const filteredMembers = useMemo(() => {
    const members = group?.members ?? [];
    if (!rosterSearch.trim()) return members;
    const q = rosterSearch.trim().toLowerCase();
    return members.filter(
      (m) =>
        `${m.member.firstName} ${m.member.lastName}`.toLowerCase().includes(q) ||
        m.member.membershipNumber.toLowerCase().includes(q),
    );
  }, [group?.members, rosterSearch]);

  const addForm = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { roleInGroup: 'Member' },
  });

  const editForm = useForm<EditGroupValues>({
    resolver: zodResolver(editGroupSchema),
  });

  const addMemberMutation = useMutation({
    mutationFn: (values: AddMemberValues) => addGroupMember(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setAddOpen(false);
      addForm.reset();
      setFormError(null);
      setAddMemberLabel(undefined);
      toast.success('Member added to group!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to add member';
      setFormError(message);
      toast.error('Failed to add member', message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeGroupMember(id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      toast.success('Member removed from group');
    },
    onError: (err) => toast.error('Failed to remove member', err instanceof ApiError ? err.message : undefined),
  });

  const editMutation = useMutation({
    mutationFn: (values: EditGroupValues) => updateGroup(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setEditOpen(false);
      setFormError(null);
      toast.success('Group updated!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to update group';
      setFormError(message);
      toast.error('Failed to update group', message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/groups')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
        </Button>
        <p className="text-destructive font-medium">Group not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/groups">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{group.name}</h1>
            <Badge variant={group.isActive ? 'default' : 'secondary'}>
              {group.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          )}
        </div>

        {hasPermission('group.update') && (
          <Button
            variant="outline"
            className="gap-2 print:hidden"
            onClick={() => {
              editForm.reset({
                name: group.name,
                description: group.description || '',
                meetingSchedule: group.meetingSchedule || '',
                meetingVenue: group.meetingVenue || '',
                contactPhone: group.contactPhone || '',
                contactEmail: group.contactEmail || '',
                leaderMemberId: group.leaderMember?.id || '',
                assistantLeaderMemberId: group.assistantLeaderMember?.id || '',
              });
              setEditLeaderLabel(
                group.leaderMember ? `${group.leaderMember.firstName} ${group.leaderMember.lastName}` : undefined,
              );
              setEditOpen(true);
            }}
          >
            <Edit className="h-4 w-4" /> Edit Group
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Meeting Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              {group.meetingSchedule || 'Not specified'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Meeting Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              {group.meetingVenue || 'Not specified'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Group Leader</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-primary shrink-0" />
              {group.leaderMember
                ? `${group.leaderMember.firstName} ${group.leaderMember.lastName}`
                : 'Unassigned'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary shrink-0" />
              {group.members.length} Enrolled Members
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Group Roster</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Members registered under {group.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roster…"
                className="pl-8"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
              />
            </div>
            <ListActions
              onExport={() =>
                exportToCsv(`group-${group.name}`, filteredMembers, [
                  { header: 'Member Name', accessor: (m) => `${m.member.firstName} ${m.member.lastName}` },
                  { header: 'Membership No.', accessor: (m) => m.member.membershipNumber },
                  { header: 'Role', accessor: (m) => m.roleInGroup },
                ])
              }
              exportDisabled={filteredMembers.length === 0}
            />
            {hasPermission('group.update') && (
              <Sheet open={addOpen} onOpenChange={setAddOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="gap-2 print:hidden">
                    <Plus className="h-4 w-4" /> Add Member
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <form
                    onSubmit={addForm.handleSubmit((values) => addMemberMutation.mutate(values))}
                    className="flex h-full flex-col"
                  >
                    <SheetHeader>
                      <SheetTitle>Add Member to {group.name}</SheetTitle>
                      <SheetDescription>
                        Select a church member to enroll into this group.
                      </SheetDescription>
                    </SheetHeader>

                    <SheetBody className="space-y-4">
                      {formError && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                          {formError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="memberId">Select Member *</Label>
                        <MemberCombobox
                          id="memberId"
                          value={addForm.watch('memberId')}
                          selectedLabel={addMemberLabel}
                          onSelect={(member) => {
                            addForm.setValue('memberId', member.id);
                            setAddMemberLabel(`${member.firstName} ${member.lastName} (${member.membershipNumber})`);
                          }}
                          placeholder="Choose a member..."
                        />
                        {addForm.formState.errors.memberId && (
                          <p className="text-xs text-destructive">
                            {addForm.formState.errors.memberId.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="roleInGroup">Role in Group</Label>
                        <Input
                          id="roleInGroup"
                          placeholder="e.g. Member, Band Leader, Secretary"
                          {...addForm.register('roleInGroup')}
                        />
                      </div>
                    </SheetBody>

                    <SheetFooter>
                      <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addMemberMutation.isPending}>
                        {addMemberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add to Roster
                      </Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {rosterSearch ? 'No members match your search.' : 'No members enrolled in this group yet.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone / Email</TableHead>
                  <TableHead>Date Joined</TableHead>
                  {hasPermission('group.update') && <TableHead className="w-12 print:hidden"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/members/${m.member.id}`}
                        className="hover:underline text-primary"
                      >
                        {m.member.firstName} {m.member.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.member.membershipNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.roleInGroup}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.member.phone || m.member.email || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </TableCell>
                    {hasPermission('group.update') && (
                      <TableCell className="print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeMemberMutation.mutate(m.member.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Group Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <form
            onSubmit={editForm.handleSubmit((values) => editMutation.mutate(values))}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Edit Group Details</SheetTitle>
              <SheetDescription>
                Update description, meeting schedule, or leaders for {group.name}.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-group-name">Group Name *</Label>
                <Input id="edit-group-name" {...editForm.register('name')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-group-description">Description</Label>
                <Input id="edit-group-description" {...editForm.register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-group-schedule">Schedule</Label>
                  <Input id="edit-group-schedule" {...editForm.register('meetingSchedule')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-group-venue">Venue</Label>
                  <Input id="edit-group-venue" {...editForm.register('meetingVenue')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-group-leader">Group Leader</Label>
                <MemberCombobox
                  id="edit-group-leader"
                  value={editForm.watch('leaderMemberId')}
                  selectedLabel={editLeaderLabel}
                  onSelect={(member) => {
                    editForm.setValue('leaderMemberId', member.id);
                    setEditLeaderLabel(`${member.firstName} ${member.lastName}`);
                  }}
                  onClear={() => {
                    editForm.setValue('leaderMemberId', undefined);
                    setEditLeaderLabel(undefined);
                  }}
                  placeholder="Select leader..."
                />
              </div>
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

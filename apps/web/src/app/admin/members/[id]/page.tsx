'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, Check, Loader2, Pencil, Users, Users2 } from 'lucide-react';
import {
  fetchMember,
  fetchMemberCategories,
  fetchMembershipStatuses,
  updateMember,
} from '@/lib/api/members';
import { fetchGroups } from '@/lib/api/groups';
import { fetchMinistries } from '@/lib/api/ministries';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetBody,
  SheetTitle,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : null;
}

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

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);
  const [editMinistryIds, setEditMinistryIds] = useState<string[]>([]);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const memberQuery = useQuery({ queryKey: ['members', id], queryFn: () => fetchMember(id) });
  const categoriesQuery = useQuery({ queryKey: ['member-categories'], queryFn: fetchMemberCategories });
  const statusesQuery = useQuery({ queryKey: ['membership-statuses'], queryFn: fetchMembershipStatuses });
  const groupsQuery = useQuery({ queryKey: ['groups'], queryFn: fetchGroups });
  const ministriesQuery = useQuery({ queryKey: ['ministries'], queryFn: fetchMinistries });

  const editForm = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema) });

  const updateMutation = useMutation({
    mutationFn: (values: MemberFormValues) =>
      updateMember(id, {
        ...values,
        email: values.email || undefined,
        groupIds: editGroupIds,
        ministryIds: editMinistryIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member details updated successfully!');
      setEditSheetOpen(false);
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Failed to update member';
      setEditFormError(message);
      toast.error('Failed to update member', message);
    },
  });

  const openEditSheet = () => {
    if (!memberQuery.data) return;
    const m = memberQuery.data;
    setEditFormError(null);
    editForm.reset({
      firstName: m.firstName,
      lastName: m.lastName,
      gender: m.gender,
      phone: m.phone || '',
      email: m.email || '',
      memberCategoryId: m.memberCategory.id,
      membershipStatusId: m.membershipStatus.id,
    });
    setEditGroupIds(m.groupMemberships?.map((g) => g.group.id) ?? []);
    setEditMinistryIds(m.ministryMemberships?.map((mm) => mm.ministry.id) ?? []);
    setEditSheetOpen(true);
  };

  const onEditSubmit = (values: MemberFormValues) => {
    setEditFormError(null);
    updateMutation.mutate(values);
  };

  if (memberQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading member…
      </div>
    );
  }

  if (memberQuery.isError || !memberQuery.data) {
    return <p className="py-8 text-center text-sm text-destructive">Member not found.</p>;
  }

  const member = memberQuery.data;
  const canUpdate = hasPermission('member.update');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link href="/admin/members">
              <ArrowLeft className="h-4 w-4" />
              Back to members
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {member.firstName} {member.middleName ? `${member.middleName} ` : ''}
              {member.lastName}
            </h1>
            <Badge variant="secondary">{member.memberCategory.name}</Badge>
            <Badge variant={member.isActive ? 'success' : 'destructive'}>{member.membershipStatus.name}</Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">{member.membershipNumber}</p>
        </div>

        {canUpdate && (
          <Button onClick={openEditSheet} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit Member &amp; Groups
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Gender" value={member.gender === 'MALE' ? 'Male' : 'Female'} />
            <Field label="Date of birth" value={formatDate(member.dateOfBirth)} />
            <Field label="Marital status" value={member.maritalStatus} />
            <Field label="Marriage date" value={formatDate(member.marriageDate)} />
            <Field label="Occupation" value={member.occupation} />
            <Field label="Local society" value={member.localSociety} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Phone" value={member.phone} />
            <Field label="WhatsApp" value={member.whatsappNumber} />
            <Field label="Email" value={member.email} />
            <Field label="Ghana region" value={member.ghanaRegion} />
            <Field label="District" value={member.ghanaDistrict} />
            <Field label="Digital address" value={member.digitalAddress} />
            <div className="col-span-2">
              <Field label="Residential address" value={member.residentialAddress} />
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Users className="h-4 w-4 text-amber-600 admin-dark:text-amber-400" />
            <CardTitle className="text-base">Church Groups ({member.groupMemberships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {member.groupMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not assigned to any church groups.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {member.groupMemberships.map((gm) => (
                  <Badge
                    key={gm.id}
                    variant="outline"
                    className="px-3 py-1 text-xs gap-1.5 bg-amber-50 admin-dark:bg-amber-950/40 text-amber-800 admin-dark:text-amber-200 border-amber-300"
                  >
                    <Users className="h-3 w-3" />
                    {gm.group.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Ministries */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Building2 className="h-4 w-4 text-blue-600 admin-dark:text-blue-400" />
            <CardTitle className="text-base">Church Ministries ({member.ministryMemberships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {member.ministryMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not assigned to any church ministries.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {member.ministryMemberships.map((mm) => (
                  <Badge
                    key={mm.id}
                    variant="outline"
                    className="px-3 py-1 text-xs gap-1.5 bg-blue-50 admin-dark:bg-blue-950/40 text-blue-800 admin-dark:text-blue-200 border-blue-300"
                  >
                    <Building2 className="h-3 w-3" />
                    {mm.ministry.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Church record</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Date joined church" value={formatDate(member.dateJoinedChurch)} />
            <Field label="Baptized" value={member.baptized ? `Yes — ${formatDate(member.baptismDate) ?? ''}` : 'No'} />
            <Field label="Confirmed" value={member.confirmed ? `Yes — ${formatDate(member.confirmationDate) ?? ''}` : 'No'} />
            <Field label="Skills" value={member.skills} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Name" value={member.emergencyContactName} />
            <Field label="Phone" value={member.emergencyContactPhone} />
            <Field label="Relationship" value={member.emergencyContactRelationship} />
          </CardContent>
        </Card>

        {member.familyMemberships.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Family</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.familyMemberships.map((fm) => (
                <div key={fm.family.id}>
                  <p className="text-sm font-medium">
                    {fm.family.name} <span className="text-muted-foreground">({fm.role.toLowerCase()})</span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {fm.family.members
                      .filter((m) => m.member.id !== member.id)
                      .map((m) => (
                        <Badge key={m.member.id} variant="outline">
                          {m.member.firstName} {m.member.lastName} · {m.role.toLowerCase()}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {member.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{member.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Member Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={(val: boolean) => setEditSheetOpen(val)}>
        <SheetContent className="sm:max-w-md">
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex h-full flex-col" noValidate>
            <SheetHeader>
              <SheetTitle>Edit Member Details &amp; Assignments</SheetTitle>
              <SheetDescription>
                Update details, groups, and ministries for {member.firstName} {member.lastName}.
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="detail-edit-firstName">First name *</Label>
                  <Input id="detail-edit-firstName" {...editForm.register('firstName')} />
                  {editForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail-edit-lastName">Last name *</Label>
                  <Input id="detail-edit-lastName" {...editForm.register('lastName')} />
                  {editForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail-edit-gender">Gender *</Label>
                <Controller
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="detail-edit-gender">
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
                  <Label htmlFor="detail-edit-phone">Phone</Label>
                  <Input id="detail-edit-phone" placeholder="+233…" {...editForm.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail-edit-email">Email</Label>
                  <Input id="detail-edit-email" type="email" {...editForm.register('email')} />
                  {editForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="detail-edit-memberCategoryId">Category *</Label>
                  <Controller
                    control={editForm.control}
                    name="memberCategoryId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="detail-edit-memberCategoryId">
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
                  <Label htmlFor="detail-edit-membershipStatusId">Status *</Label>
                  <Controller
                    control={editForm.control}
                    name="membershipStatusId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="detail-edit-membershipStatusId">
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
                              prev.includes(group.id) ? prev.filter((gId) => gId !== group.id) : [...prev, group.id]
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
                                ? prev.filter((mId) => mId !== ministry.id)
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
    </div>
  );
}

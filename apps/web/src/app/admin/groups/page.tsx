'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { UsersRound, Plus, Users, Search, Loader2, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { fetchGroups, createGroup, updateGroup, deleteGroup, GroupListItem } from '@/lib/api/groups';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const groupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  meetingSchedule: z.string().optional(),
  meetingVenue: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function GroupsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupListItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setOpen(false);
      reset();
      setFormError(null);
      toast.success('Group created!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to create group';
      setFormError(message);
      toast.error('Failed to create group', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<GroupFormValues>) => updateGroup(editingGroup!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setEditingGroup(null);
      reset();
      setFormError(null);
      toast.success('Group updated!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to update group';
      setFormError(message);
      toast.error('Failed to update group', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setDeleteId(null);
      toast.success('Group deleted');
    },
    onError: (err) => toast.error('Failed to delete group', err instanceof ApiError ? err.message : undefined),
  });

  const openEdit = (g: GroupListItem) => {
    setEditingGroup(g);
    setValue('name', g.name);
    setValue('description', g.description || '');
    setValue('meetingSchedule', g.meetingSchedule || '');
    setValue('meetingVenue', g.meetingVenue || '');
    setValue('contactPhone', g.contactPhone || '');
    setValue('contactEmail', g.contactEmail || '');
    setFormError(null);
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UsersRound className="h-6 w-6 text-primary" />
            Church Groups & Fellowships
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage fellowship bands, cell groups, and sub-organizations within the society.
          </p>
        </div>

        {hasPermission('group.create') && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Group
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>Add New Church Group</SheetTitle>
                  <SheetDescription>
                    Create a new fellowship band, study group, or organization.
                  </SheetDescription>
                </SheetHeader>

                <SheetBody className="space-y-4">
                  {formError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name *</Label>
                    <Input id="name" placeholder="e.g. Singing Band" {...register('name')} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Purpose and membership scope" {...register('description')} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                      <Input id="meetingSchedule" placeholder="e.g. Saturdays @ 5:00 PM" {...register('meetingSchedule')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetingVenue">Meeting Venue</Label>
                      <Input id="meetingVenue" placeholder="e.g. Church Hall" {...register('meetingVenue')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" placeholder="024XXXXXXX" {...register('contactPhone')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" placeholder="group@church.org" {...register('contactEmail')} />
                      {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
                    </div>
                  </div>
                </SheetBody>

                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Group
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center">
          <UsersRound className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="font-medium text-foreground">No groups found</p>
          <p className="text-sm text-muted-foreground">Add a new church group to manage its members.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <Card key={g.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{g.name}</CardTitle>
                    {g.description && (
                      <CardDescription className="line-clamp-2 mt-1">{g.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={g.isActive ? 'default' : 'secondary'}>
                      {g.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {hasPermission('group.update') && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {hasPermission('group.delete') && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(g.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm flex-1">
                {g.leaderMember && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Leader: </span>
                    {g.leaderMember.firstName} {g.leaderMember.lastName}
                  </div>
                )}

                {g.meetingSchedule && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{g.meetingSchedule}</span>
                  </div>
                )}

                {g.meetingVenue && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{g.meetingVenue}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {g._count?.members ?? 0} Members
                  </span>
                  <Link
                    href={`/admin/groups/${g.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View Roster &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Group Sheet */}
      <Sheet open={!!editingGroup} onOpenChange={(val: boolean) => !val && setEditingGroup(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Edit Church Group</SheetTitle>
              <SheetDescription>Update information for this fellowship group.</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-name">Group Name *</Label>
                <Input id="edit-name" placeholder="e.g. Singing Band" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input id="edit-description" placeholder="Purpose and membership scope" {...register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-meetingSchedule">Meeting Schedule</Label>
                  <Input id="edit-meetingSchedule" placeholder="e.g. Saturdays @ 5:00 PM" {...register('meetingSchedule')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-meetingVenue">Meeting Venue</Label>
                  <Input id="edit-meetingVenue" placeholder="e.g. Church Hall" {...register('meetingVenue')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                  <Input id="edit-contactPhone" placeholder="024XXXXXXX" {...register('contactPhone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactEmail">Contact Email</Label>
                  <Input id="edit-contactEmail" placeholder="group@church.org" {...register('contactEmail')} />
                  {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Group
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Group Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


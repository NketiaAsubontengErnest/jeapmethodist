'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Crown, Plus, Loader2, UserCheck, Shield, Trash2, Pencil, Upload, Search, User as UserIcon } from 'lucide-react';
import {
  fetchLeadership,
  fetchPositions,
  createLeadership,
  updateLeadership,
  createPosition,
  updatePosition,
  deletePosition,
  deleteLeadership,
  ChurchLeadershipItem,
  ChurchPosition,
} from '@/lib/api/leadership';
import { uploadMedia } from '@/lib/api/media';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberCombobox } from '@/components/ui/member-combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const positionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.string().optional(),
  description: z.string().optional(),
});
type PositionValues = z.infer<typeof positionSchema>;

const leadershipSchema = z.object({
  positionId: z.string().min(1, 'Please select a position'),
  memberId: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  bio: z.string().optional(),
  displayOrder: z.coerce.number().optional(),
});
type LeadershipFormValues = z.infer<typeof leadershipSchema>;

export default function LeadershipPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [leaderOpen, setLeaderOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<ChurchPosition | null>(null);
  const [deletePosId, setDeletePosId] = useState<string | null>(null);
  const [deletePosError, setDeletePosError] = useState<string | null>(null);

  const [editingLeader, setEditingLeader] = useState<ChurchLeadershipItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedMemberLabel, setSelectedMemberLabel] = useState<string | undefined>(undefined);
  const [editSelectedMemberLabel, setEditSelectedMemberLabel] = useState<string | undefined>(undefined);
  const [rosterSearch, setRosterSearch] = useState('');

  const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);
  const [leaderPhotoPreview, setLeaderPhotoPreview] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const canUploadPhoto = hasPermission('media.upload');

  const handlePhotoSelect = (file: File | null, setFile: (f: File | null) => void, setPreview: (u: string | null) => void) => {
    setFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const { data: leadership = [], isLoading: loadLeader } = useQuery({
    queryKey: ['leadership'],
    queryFn: fetchLeadership,
  });

  const { data: positions = [], isLoading: loadPos } = useQuery({
    queryKey: ['positions'],
    queryFn: fetchPositions,
  });

  const posForm = useForm<PositionValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: { category: 'Lay Leadership' },
  });

  const editPosForm = useForm<PositionValues>({
    resolver: zodResolver(positionSchema),
  });

  const leaderForm = useForm<LeadershipFormValues>({
    resolver: zodResolver(leadershipSchema),
  });

  const editLeaderForm = useForm<LeadershipFormValues>({
    resolver: zodResolver(leadershipSchema),
  });

  const createPosMutation = useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setPosOpen(false);
      posForm.reset();
      setFormError(null);
      toast.success('Position created!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to create position';
      setFormError(message);
      toast.error('Failed to create position', message);
    },
  });

  const updatePosMutation = useMutation({
    mutationFn: (data: Partial<PositionValues>) => updatePosition(editingPos!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setEditingPos(null);
      editPosForm.reset();
      setFormError(null);
      toast.success('Position updated!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to update position';
      setFormError(message);
      toast.error('Failed to update position', message);
    },
  });

  const deletePosMutation = useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setDeletePosId(null);
      setDeletePosError(null);
      toast.success('Position deleted');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to delete position';
      setDeletePosError(message);
      toast.error('Failed to delete position', message);
    },
  });

  const createLeaderMutation = useMutation({
    mutationFn: createLeadership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership'] });
      setLeaderOpen(false);
      leaderForm.reset();
      setFormError(null);
      setLeaderPhotoFile(null);
      setLeaderPhotoPreview(null);
      setSelectedMemberLabel(undefined);
      toast.success('Leadership profile added!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to assign leadership profile';
      setFormError(message);
      toast.error('Failed to assign leadership profile', message);
    },
  });

  const updateLeaderMutation = useMutation({
    mutationFn: (data: Partial<LeadershipFormValues> & { photoUrl?: string }) => updateLeadership(editingLeader!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership'] });
      setEditingLeader(null);
      editLeaderForm.reset();
      setFormError(null);
      setEditSelectedMemberLabel(undefined);
      toast.success('Leadership profile updated!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to update leadership profile';
      setFormError(message);
      toast.error('Failed to update leadership profile', message);
    },
  });

  const deleteLeaderMutation = useMutation({
    mutationFn: deleteLeadership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership'] });
      setDeleteId(null);
      toast.success('Leadership profile deleted');
    },
    onError: (err) => toast.error('Failed to delete leadership profile', err instanceof ApiError ? err.message : undefined),
  });

  const openEditPosition = (p: ChurchPosition) => {
    setEditingPos(p);
    editPosForm.setValue('title', p.title);
    editPosForm.setValue('category', p.category || 'Lay Leadership');
    editPosForm.setValue('description', p.description || '');
    setFormError(null);
  };

  const openEditLeader = (item: ChurchLeadershipItem) => {
    setEditingLeader(item);
    editLeaderForm.setValue('positionId', item.positionId);
    editLeaderForm.setValue('memberId', item.memberId || '');
    editLeaderForm.setValue('name', item.name || '');
    editLeaderForm.setValue('phone', item.phone || '');
    editLeaderForm.setValue('email', item.email || '');
    editLeaderForm.setValue('bio', item.bio || '');
    setFormError(null);
    setEditPhotoFile(null);
    setEditPhotoPreview(item.photoUrl || item.member?.profilePhotoUrl || null);
    setEditSelectedMemberLabel(item.member ? `${item.member.firstName} ${item.member.lastName}` : undefined);
  };

  const filteredLeadership = useMemo(() => {
    if (!rosterSearch.trim()) return leadership;
    const q = rosterSearch.trim().toLowerCase();
    return leadership.filter((item) => {
      const leaderName = item.member ? `${item.member.firstName} ${item.member.lastName}` : item.name || '';
      return leaderName.toLowerCase().includes(q) || item.position.title.toLowerCase().includes(q);
    });
  }, [leadership, rosterSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Church Leadership
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure ecclesiastical and lay leadership positions, pastoral profiles, and society stewards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('leadership.create') && (
            <>
              <Sheet open={posOpen} onOpenChange={setPosOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 print:hidden">
                    <Plus className="h-4 w-4" /> Add Position
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <form
                    onSubmit={posForm.handleSubmit((val) => createPosMutation.mutate(val))}
                    className="flex h-full flex-col"
                  >
                    <SheetHeader>
                      <SheetTitle>Add Leadership Position Title</SheetTitle>
                      <SheetDescription>
                        Create a position such as Society Steward, Lay President, etc.
                      </SheetDescription>
                    </SheetHeader>

                    <SheetBody className="space-y-4">
                      {formError && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                          {formError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="pos-title">Position Title *</Label>
                        <Input id="pos-title" placeholder="e.g. Society Steward" {...posForm.register('title')} />
                        {posForm.formState.errors.title && (
                          <p className="text-xs text-destructive">{posForm.formState.errors.title.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pos-category">Category</Label>
                        <Input id="pos-category" placeholder="Clergy, Executive, Lay Leadership, etc." {...posForm.register('category')} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pos-desc">Description</Label>
                        <Input id="pos-desc" placeholder="Role responsibilities" {...posForm.register('description')} />
                      </div>
                    </SheetBody>

                    <SheetFooter>
                      <Button type="button" variant="outline" onClick={() => setPosOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPosMutation.isPending}>
                        {createPosMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Position
                      </Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>

              <Sheet open={leaderOpen} onOpenChange={setLeaderOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2 print:hidden">
                    <Plus className="h-4 w-4" /> Assign Leader
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-[500px]">
                  <form
                    onSubmit={leaderForm.handleSubmit(async (val) => {
                      setFormError(null);
                      let photoUrl: string | undefined;
                      if (leaderPhotoFile) {
                        setUploadingPhoto(true);
                        try {
                          const media = await uploadMedia(leaderPhotoFile, { category: 'Leadership' });
                          photoUrl = media.url;
                        } catch (err) {
                          setUploadingPhoto(false);
                          setFormError(err instanceof ApiError ? err.message : 'Failed to upload photo');
                          return;
                        }
                        setUploadingPhoto(false);
                      }
                      createLeaderMutation.mutate({ ...val, photoUrl });
                    })}
                    className="flex h-full flex-col"
                  >
                    <SheetHeader>
                      <SheetTitle>Assign Leadership Profile</SheetTitle>
                      <SheetDescription>
                        Link a church member or record external leader information for a position.
                      </SheetDescription>
                    </SheetHeader>

                    <SheetBody className="space-y-4">
                      {formError && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                          {formError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="positionId">Leadership Position *</Label>
                        <Select
                          onValueChange={(v: string) => leaderForm.setValue('positionId', v)}
                          value={leaderForm.watch('positionId')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select position..." />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.title} ({p.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memberId">Select Registered Member (Optional)</Label>
                        <MemberCombobox
                          id="memberId"
                          value={leaderForm.watch('memberId')}
                          selectedLabel={selectedMemberLabel}
                          onSelect={(member) => {
                            leaderForm.setValue('memberId', member.id);
                            setSelectedMemberLabel(`${member.firstName} ${member.lastName} (${member.membershipNumber})`);
                          }}
                          onClear={() => {
                            leaderForm.setValue('memberId', undefined);
                            setSelectedMemberLabel(undefined);
                          }}
                          placeholder="Choose a member or enter below..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Leader Name (If non-member / fallback)</Label>
                        <Input id="name" placeholder="e.g. Rev. Kwame Asante" {...leaderForm.register('name')} />
                      </div>

                      {canUploadPhoto && (
                        <div className="space-y-2">
                          <Label htmlFor="leader-photo">Photo (Optional)</Label>
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                              {leaderPhotoPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={leaderPhotoPreview} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <UserIcon className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <label
                              htmlFor="leader-photo"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                            >
                              <Upload className="h-3.5 w-3.5" /> Choose photo
                            </label>
                            <input
                              id="leader-photo"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="hidden"
                              onChange={(e) => handlePhotoSelect(e.target.files?.[0] ?? null, setLeaderPhotoFile, setLeaderPhotoPreview)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" placeholder="024XXXXXXX" {...leaderForm.register('phone')} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" placeholder="leader@church.org" {...leaderForm.register('email')} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biography / Profile</Label>
                        <Input id="bio" placeholder="Brief background & pastoral profile" {...leaderForm.register('bio')} />
                      </div>
                    </SheetBody>

                    <SheetFooter>
                      <Button type="button" variant="outline" onClick={() => setLeaderOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createLeaderMutation.isPending || uploadingPhoto}>
                        {(createLeaderMutation.isPending || uploadingPhoto) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {uploadingPhoto ? 'Uploading photo…' : 'Save Profile'}
                      </Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Configured Positions
            </CardTitle>
            <CardDescription className="text-xs">
              Ecclesiastical & lay titles in the society
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadPos ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : positions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No positions created yet.</p>
            ) : (
              <div className="space-y-2">
                {positions.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-border pb-2 text-xs">
                    <div>
                      <p className="font-medium text-foreground">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground">{p.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasPermission('leadership.update') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditPosition(p)}
                          title="Edit Position"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {hasPermission('leadership.delete') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletePosId(p.id);
                            setDeletePosError(null);
                          }}
                          title="Delete Position"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Active Leadership Roster
              </CardTitle>
              <CardDescription className="text-xs">
                Current leaders serving in church positions
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-xs print:hidden">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by leader or position…"
                  className="pl-8"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                />
              </div>
              <ListActions
                onExport={() =>
                  exportToCsv('leadership-roster', filteredLeadership, [
                    {
                      header: 'Leader',
                      accessor: (item) => (item.member ? `${item.member.firstName} ${item.member.lastName}` : item.name ?? ''),
                    },
                    { header: 'Position Title', accessor: (item) => item.position.title },
                    { header: 'Category', accessor: (item) => item.position.category ?? '' },
                    { header: 'Contact', accessor: (item) => item.phone ?? item.email ?? '' },
                  ])
                }
                exportDisabled={filteredLeadership.length === 0}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loadLeader ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLeadership.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {rosterSearch ? 'No leaders match your search.' : 'No active leadership profiles recorded yet.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leader</TableHead>
                    <TableHead>Position Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="w-24 text-right print:hidden">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeadership.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                            {item.photoUrl || item.member?.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photoUrl || item.member?.profilePhotoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            {item.member ? (
                              <span>
                                {item.member.firstName} {item.member.lastName}
                              </span>
                            ) : (
                              <span>{item.name || 'Anonymous Leader'}</span>
                            )}
                            {item.bio && <p className="text-xs text-muted-foreground line-clamp-1">{item.bio}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.position.title}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.position.category}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.phone || item.email || '-'}
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('leadership.update') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditLeader(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('leadership.delete') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Leadership Position Sheet */}
      <Sheet open={!!editingPos} onOpenChange={(val: boolean) => !val && setEditingPos(null)}>
        <SheetContent>
          <form
            onSubmit={editPosForm.handleSubmit((val) => updatePosMutation.mutate(val))}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Edit Leadership Position</SheetTitle>
              <SheetDescription>Update title and role details for this leadership position.</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-pos-title">Position Title *</Label>
                <Input id="edit-pos-title" placeholder="e.g. Society Steward" {...editPosForm.register('title')} />
                {editPosForm.formState.errors.title && (
                  <p className="text-xs text-destructive">{editPosForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-pos-category">Category</Label>
                <Input id="edit-pos-category" placeholder="Clergy, Executive, Lay Leadership, etc." {...editPosForm.register('category')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-pos-desc">Description</Label>
                <Input id="edit-pos-desc" placeholder="Role responsibilities" {...editPosForm.register('description')} />
              </div>
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPos(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePosMutation.isPending}>
                {updatePosMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Position Dialog */}
      <Dialog open={!!deletePosId} onOpenChange={(val: boolean) => !val && setDeletePosId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leadership position?
            </DialogDescription>
          </DialogHeader>
          {deletePosError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {deletePosError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePosId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletePosId && deletePosMutation.mutate(deletePosId)}
              disabled={deletePosMutation.isPending}
            >
              {deletePosMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leadership Sheet */}
      <Sheet open={!!editingLeader} onOpenChange={(val: boolean) => !val && setEditingLeader(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <form
            onSubmit={editLeaderForm.handleSubmit(async (val) => {
              setFormError(null);
              let photoUrl: string | undefined;
              if (editPhotoFile) {
                setUploadingPhoto(true);
                try {
                  const media = await uploadMedia(editPhotoFile, { category: 'Leadership' });
                  photoUrl = media.url;
                } catch (err) {
                  setUploadingPhoto(false);
                  setFormError(err instanceof ApiError ? err.message : 'Failed to upload photo');
                  return;
                }
                setUploadingPhoto(false);
              }
              updateLeaderMutation.mutate(photoUrl ? { ...val, photoUrl } : val);
            })}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Edit Leadership Profile</SheetTitle>
              <SheetDescription>
                Update leadership position details and contact information.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-positionId">Leadership Position *</Label>
                <Select
                  onValueChange={(v: string) => editLeaderForm.setValue('positionId', v)}
                  value={editLeaderForm.watch('positionId')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title} ({p.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-memberId">Select Registered Member (Optional)</Label>
                <MemberCombobox
                  id="edit-memberId"
                  value={editLeaderForm.watch('memberId')}
                  selectedLabel={editSelectedMemberLabel}
                  onSelect={(member) => {
                    editLeaderForm.setValue('memberId', member.id);
                    setEditSelectedMemberLabel(`${member.firstName} ${member.lastName} (${member.membershipNumber})`);
                  }}
                  onClear={() => {
                    editLeaderForm.setValue('memberId', undefined);
                    setEditSelectedMemberLabel(undefined);
                  }}
                  placeholder="Choose a member or enter below..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Leader Name (If non-member / fallback)</Label>
                <Input id="edit-name" placeholder="e.g. Rev. Kwame Asante" {...editLeaderForm.register('name')} />
              </div>

              {canUploadPhoto && (
                <div className="space-y-2">
                  <Label htmlFor="edit-leader-photo">Photo (Optional)</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                      {editPhotoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editPhotoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <label
                      htmlFor="edit-leader-photo"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
                    >
                      <Upload className="h-3.5 w-3.5" /> Change photo
                    </label>
                    <input
                      id="edit-leader-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handlePhotoSelect(e.target.files?.[0] ?? null, setEditPhotoFile, setEditPhotoPreview)}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" placeholder="024XXXXXXX" {...editLeaderForm.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" placeholder="leader@church.org" {...editLeaderForm.register('email')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bio">Biography / Profile</Label>
                <Input id="edit-bio" placeholder="Brief background & pastoral profile" {...editLeaderForm.register('bio')} />
              </div>
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditingLeader(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateLeaderMutation.isPending || uploadingPhoto}>
                {(updateLeaderMutation.isPending || uploadingPhoto) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploadingPhoto ? 'Uploading photo…' : 'Update Profile'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Leadership Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Leadership Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this leader from their position?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteLeaderMutation.mutate(deleteId)}
              disabled={deleteLeaderMutation.isPending}
            >
              {deleteLeaderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



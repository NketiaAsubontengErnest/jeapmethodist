'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, UserX, Shield, ShieldCheck, Pencil, Trash2, CheckSquare, Square, Users as UsersIcon } from 'lucide-react';
import { fetchUsers, createUser, deactivateUser, type UserListItem } from '@/lib/api/users';
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  type RoleItem,
  type PermissionItem,
} from '@/lib/api/roles';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.string().min(1, 'Select a role'),
});
type CreateUserValues = z.infer<typeof createUserSchema>;

function initials(user: UserListItem) {
  return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Roles / Permissions State
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleFormError, setRoleFormError] = useState<string | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteRoleError, setDeleteRoleError] = useState<string | null>(null);

  // Queries
  const usersQuery = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => fetchUsers({ page, search: search || undefined }),
  });

  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
    enabled: roleSheetOpen,
  });

  const allPermissions = permissionsQuery.data || [];

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc, perm) => {
    const mod = perm.module || 'general';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  // User Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({ resolver: zodResolver(createUserSchema) });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      reset();
    },
    onError: (error) => setUserFormError(error instanceof ApiError ? error.message : 'Failed to create user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  // Role Mutations
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleSheetOpen(false);
      resetRoleForm();
    },
    onError: (err) => setRoleFormError(err instanceof ApiError ? err.message : 'Failed to create user type'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; permissionCodes?: string[] } }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleSheetOpen(false);
      resetRoleForm();
    },
    onError: (err) => setRoleFormError(err instanceof ApiError ? err.message : 'Failed to update user type'),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteRoleId(null);
      setDeleteRoleError(null);
    },
    onError: (err) => setDeleteRoleError(err instanceof ApiError ? err.message : 'Failed to delete user type'),
  });

  const canCreateUser = hasPermission('user.create');
  const canDeleteUser = hasPermission('user.delete');
  const canManageSettings = hasPermission('settings.manage') || hasPermission('user.update');

  const resetRoleForm = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDesc('');
    setSelectedPermissions([]);
    setRoleFormError(null);
  };

  const openCreateRoleModal = () => {
    resetRoleForm();
    setRoleSheetOpen(true);
  };

  const openEditRoleModal = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setRoleFormError(null);
    setRoleSheetOpen(true);
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const toggleModulePermissions = (modulePerms: PermissionItem[]) => {
    const codes = modulePerms.map((p) => p.code);
    const allSelected = codes.every((c) => selectedPermissions.includes(c));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((c) => !codes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...codes])));
    }
  };

  const onRoleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setRoleFormError('User Type Name is required.');
      return;
    }
    setRoleFormError(null);
    if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        data: {
          name: roleName.trim(),
          description: roleDesc.trim() || undefined,
          permissionCodes: selectedPermissions,
        },
      });
    } else {
      createRoleMutation.mutate({
        name: roleName.trim(),
        description: roleDesc.trim() || undefined,
        permissionCodes: selectedPermissions,
      });
    }
  };

  const onSubmitUser = (values: CreateUserValues) => {
    setUserFormError(null);
    createMutation.mutate(values);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: UserListItem[] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchUsers({ page: currentPage, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('users', all, [
        { header: 'First Name', accessor: (u) => u.firstName },
        { header: 'Last Name', accessor: (u) => u.lastName },
        { header: 'Email', accessor: (u) => u.email },
        { header: 'Role', accessor: (u) => u.role.name.replace(/_/g, ' ') },
        { header: 'Active', accessor: (u) => (u.isActive ? 'Yes' : 'No') },
        { header: 'Last Login', accessor: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never') },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            User Management &amp; System Access
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts, configure User Types (Roles), and set strict access rules/permissions.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'users' | 'roles')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" /> User Accounts
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" /> User Types &amp; Rules ({rolesQuery.data?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: User Accounts */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Staff &amp; Admin Accounts</h2>
            {canCreateUser && (
              <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2 print:hidden">
                    <Plus className="h-4 w-4" /> New User
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <form onSubmit={handleSubmit(onSubmitUser)} className="flex h-full flex-col" noValidate>
                    <SheetHeader>
                      <SheetTitle>Create a new user account</SheetTitle>
                      <SheetDescription>They can sign in immediately with the role and password set here.</SheetDescription>
                    </SheetHeader>
                    <SheetBody className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input id="firstName" {...register('firstName')} />
                          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input id="lastName" {...register('lastName')} />
                          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input id="phone" placeholder="+233…" {...register('phone')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Temporary password</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleId">User Type / Role</Label>
                        <Controller
                          control={control}
                          name="roleId"
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger id="roleId">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                {rolesQuery.data?.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.roleId && <p className="text-sm text-destructive">{errors.roleId.message}</p>}
                      </div>
                      {userFormError && (
                        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {userFormError}
                        </p>
                      )}
                    </SheetBody>
                    <SheetFooter>
                      <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                        {createMutation.isPending ? 'Creating…' : 'Create User Account'}
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
                {usersQuery.data ? `${usersQuery.data.total} user account${usersQuery.data.total === 1 ? '' : 's'}` : 'User Accounts'}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-xs print:hidden">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
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
              {usersQuery.isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading users…
                </div>
              ) : usersQuery.isError ? (
                <p className="py-8 text-center text-sm text-destructive">Failed to load users. Please try again.</p>
              ) : usersQuery.data && usersQuery.data.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No users yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>User Type / Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last login</TableHead>
                      {canDeleteUser && <TableHead className="text-right print:hidden">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersQuery.data?.items.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {initials(user)}
                            </div>
                            {user.firstName} {user.lastName}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role.name.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'success' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                        </TableCell>
                        {canDeleteUser && (
                          <TableCell className="text-right print:hidden">
                            {user.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deactivateMutation.mutate(user.id)}
                                disabled={deactivateMutation.isPending}
                              >
                                <UserX className="h-4 w-4" />
                                Deactivate
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {usersQuery.data && usersQuery.data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {usersQuery.data.page} of {usersQuery.data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= usersQuery.data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: User Types & Rules (Roles & Permissions) */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">User Types &amp; Access Rules</h2>
              <p className="text-xs text-muted-foreground">
                Define custom user types (e.g. Secretary, Finance Officer) and check off their allowed rules/permissions.
              </p>
            </div>
            {canManageSettings && (
              <Button onClick={openCreateRoleModal} className="gap-2">
                <Plus className="h-4 w-4" /> Add User Type
              </Button>
            )}
          </div>

          {rolesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> Loading User Types…
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rolesQuery.data?.map((role) => (
                <Card key={role.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                          {role.name.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 text-xs">
                          {role.description || 'No description provided.'}
                        </CardDescription>
                      </div>
                      <Badge variant={role.isSystem ? 'outline' : 'secondary'} className="text-[10px] shrink-0">
                        {role.isSystem ? 'System' : 'Custom'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs flex-1">
                    <div>
                      <p className="font-semibold text-muted-foreground mb-1.5">
                        Rules / Access Granted ({role.permissions?.length ?? 0}):
                      </p>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px] font-mono">
                              {p}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic">No access rules granted.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                      {canManageSettings && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => openEditRoleModal(role)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit Rules
                        </Button>
                      )}
                      {canManageSettings && !role.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive gap-1"
                          onClick={() => {
                            setDeleteRoleId(role.id);
                            setDeleteRoleError(null);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sheet: Add / Edit User Type & Rules */}
      <Sheet open={roleSheetOpen} onOpenChange={(open: boolean) => !open && setRoleSheetOpen(false)}>
        <SheetContent className="sm:max-w-xl">
          <form onSubmit={onRoleFormSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{editingRole ? 'Edit User Type & Rules' : 'Add New User Type'}</SheetTitle>
              <SheetDescription>
                Define the role name and check off exact access rules (permissions) for this user type.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-5">
              {roleFormError && (
                <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                  {roleFormError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="roleName">User Type / Role Name *</Label>
                <Input
                  id="roleName"
                  placeholder="e.g. Welfare Officer, Choir Director, Secretary"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
                {editingRole?.isSystem && (
                  <p className="text-[11px] text-muted-foreground">
                    This is a built-in system user type — renaming it will not affect the access rules already granted to it.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleDesc">Description</Label>
                <Textarea
                  id="roleDesc"
                  placeholder="What this user type is responsible for..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Rules / Permissions Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <Label className="font-bold text-sm">Configure Allowed Rules &amp; Access Rights</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedPermissions.length} selected
                  </span>
                </div>

                {permissionsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading rules directory…
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {Object.entries(permissionsByModule).map(([mod, perms]) => {
                      const allSelected = perms.every((p) => selectedPermissions.includes(p.code));
                      return (
                        <div key={mod} className="rounded-lg border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold capitalize text-xs text-primary flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              {mod} Module
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleModulePermissions(perms)}
                              className="text-[11px] font-medium text-primary hover:underline"
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 pt-1">
                            {perms.map((p) => {
                              const checked = selectedPermissions.includes(p.code);
                              return (
                                <label
                                  key={p.id}
                                  className={`flex items-start gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                                    checked ? 'border-primary/50 bg-primary/5 font-medium' : 'border-border hover:bg-accent'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={checked}
                                    onChange={() => togglePermission(p.code)}
                                  />
                                  {checked ? (
                                    <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <p className="font-mono text-[11px] leading-tight">{p.code}</p>
                                    {p.name && <p className="text-[10px] text-muted-foreground">{p.name}</p>}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setRoleSheetOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              >
                {(createRoleMutation.isPending || updateRoleMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRole ? 'Update Access Rules' : 'Save User Type'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Dialog: Delete User Type */}
      <Dialog open={!!deleteRoleId} onOpenChange={(val: boolean) => !val && setDeleteRoleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user type? Users assigned to this role will lose their custom rule permissions.
            </DialogDescription>
          </DialogHeader>
          {deleteRoleError && (
            <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              {deleteRoleError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoleId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteRoleId && deleteRoleMutation.mutate(deleteRoleId)}
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


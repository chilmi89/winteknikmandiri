"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/data-table/StatusBadge";
import DataTableShell from "@/components/dashboard/data-table/DataTableShell";
import { ConfirmDialog } from "@/components/dashboard/dialogs/ConfirmDialog";
import { toast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/dashboard/format";
import {
  createUser,
  deleteUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserItem,
} from "@/lib/users";
import { UserDialog } from "./UserDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export default function UsersManager() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      toast.add({
        title: "Gagal memuat pengguna",
        description: "Tidak dapat mengambil daftar pengguna dari server.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const activeCount = useMemo(
    () => users.filter((u) => u.is_active).length,
    [users]
  );

  async function handleCreate(payload: CreateUserPayload) {
    const created = await createUser(payload);
    setUsers((prev) => [...prev, created]);
    toast.add({
      title: "Pengguna berhasil ditambahkan",
      description: `Akun @${created.username} siap digunakan untuk login.`,
      type: "success",
    });
  }

  async function handleUpdate(id: string, payload: UpdateUserPayload) {
    const updated = await updateUser(id, payload);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    toast.add({
      title: "Pengguna berhasil diperbarui",
      description: `Perubahan profil @${updated.username} telah disimpan.`,
      type: "success",
    });
  }

  async function handleResetPassword(id: string, newPassword: string) {
    await resetUserPassword(id, newPassword);
    toast.add({
      title: "Kata sandi berhasil direset",
      description: "Pengguna dapat login dengan kata sandi baru.",
      type: "success",
    });
  }

  async function handleDeleteConfirm() {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.add({
        title: "Pengguna berhasil dihapus",
        description: `Akun @${userToDelete.username} telah dihapus dari sistem.`,
        type: "success",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus pengguna.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Kelola akun pengguna, profil, dan atur ulang kata sandi akses panel admin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="h-8 gap-1.5 rounded-lg border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setSelectedUser(null);
              setDialogOpen(true);
            }}
            className="h-8 gap-1.5 rounded-lg bg-[#2279cf] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1a63ab]"
          >
            <Plus className="size-3.5" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Ringkasan Ringkas */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80">
            <Users className="size-4.5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total Pengguna</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {users.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <UserCheck className="size-4.5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Akun Aktif</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 border border-slate-200/80">
            <UserX className="size-4.5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Non-Aktif</p>
            <p className="text-lg font-bold text-slate-700 tabular-nums">
              {users.length - activeCount}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <DataTableShell>
        {/* Toolbar Search */}
        <div className="border-b border-slate-200/80 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, username, atau email..."
                className="h-8 pl-9 text-xs"
              />
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              Menampilkan {filteredUsers.length} dari {users.length} pengguna
            </p>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-12 text-center text-xs font-semibold text-slate-600">
                  No
                </TableHead>
                <TableHead className="min-w-[200px] text-xs font-semibold text-slate-600">
                  Pengguna
                </TableHead>
                <TableHead className="w-36 text-xs font-semibold text-slate-600">
                  Username
                </TableHead>
                <TableHead className="w-28 text-center text-xs font-semibold text-slate-600">
                  Status
                </TableHead>
                <TableHead className="w-36 text-xs font-semibold text-slate-600">
                  Terdaftar
                </TableHead>
                <TableHead className="w-32 text-right pr-4 text-xs font-semibold text-slate-600">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <TableRow key={idx} className="border-b border-slate-100 animate-pulse">
                    <TableCell className="text-center">
                      <div className="mx-auto h-3 w-4 bg-slate-200" />
                    </TableCell>
                    <TableCell className="space-y-1.5">
                      <div className="h-4 w-36 bg-slate-200" />
                      <div className="h-3 w-48 bg-slate-100" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-slate-100" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="mx-auto h-5 w-16 bg-slate-200 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <div className="h-3.5 w-24 bg-slate-100" />
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="ml-auto h-7 w-20 bg-slate-200 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-36 text-center text-xs text-slate-400"
                  >
                    {search
                      ? "Tidak ada pengguna yang cocok dengan pencarian."
                      : "Belum ada data pengguna."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* No */}
                    <TableCell className="text-center font-mono text-xs text-slate-400">
                      {idx + 1}
                    </TableCell>

                    {/* Pengguna (Avatar Inisial + Nama + Email) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-[#2279cf] border border-slate-200/80">
                          {initials(user.name || user.username)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {user.name || "—"}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Username */}
                    <TableCell>
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                        @{user.username}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <StatusBadge tone={user.is_active ? "success" : "neutral"}>
                        {user.is_active ? "Aktif" : "Non-Aktif"}
                      </StatusBadge>
                    </TableCell>

                    {/* Tanggal Dibuat */}
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Profil */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setSelectedUser(user);
                            setDialogOpen(true);
                          }}
                          title="Edit Profil"
                          className="size-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Pencil className="size-3.5" />
                        </Button>

                        {/* Reset Password */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setUserToReset(user);
                            setResetDialogOpen(true);
                          }}
                          title="Reset Kata Sandi"
                          className="size-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <KeyRound className="size-3.5" />
                        </Button>

                        {/* Hapus */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteError(null);
                            setDeleteDialogOpen(true);
                          }}
                          title="Hapus Pengguna"
                          className="size-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DataTableShell>

      {/* Modal Tambah / Edit Pengguna */}
      {dialogOpen && (
        <UserDialog
          item={selectedUser}
          onClose={() => {
            setDialogOpen(false);
            setSelectedUser(null);
          }}
          onSubmitCreate={handleCreate}
          onSubmitUpdate={handleUpdate}
        />
      )}

      {/* Modal Reset Password */}
      {resetDialogOpen && userToReset && (
        <ResetPasswordDialog
          user={userToReset}
          onClose={() => {
            setResetDialogOpen(false);
            setUserToReset(null);
          }}
          onSubmitReset={handleResetPassword}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
          }
        }}
        title="Hapus Pengguna"
        description={
          userToDelete
            ? `Apakah Anda yakin ingin menghapus akun @${userToDelete.username} (${userToDelete.name})? Akun ini tidak akan dapat digunakan lagi untuk login.`
            : "Apakah Anda yakin ingin menghapus pengguna ini?"
        }
        confirmLabel="Hapus Pengguna"
        cancelLabel="Batal"
        busy={deleting}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}

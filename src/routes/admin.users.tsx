import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users — NATEAT" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const refresh = () => userService.list().then(setUsers);
  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
      <div className="rounded-2xl bg-card p-4 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left bg-secondary/60"><tr><th className="p-3">Tên</th><th className="p-3">Email</th><th className="p-3">Vai trò</th><th className="p-3">Trạng thái</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3"><span className={`rounded-md px-2 py-0.5 text-xs ${u.status === "banned" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>{u.status}</span></td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={async () => { await userService.toggleBan(u.id); refresh(); toast.success("Đã cập nhật"); }}>{u.status === "banned" ? "Mở khoá" : "Khoá"}</Button>
                  <Button size="sm" variant="secondary" onClick={async () => { const p = await userService.resetPassword(u.id); toast.success(`Mật khẩu mới: ${p}`); }}>Reset MK</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
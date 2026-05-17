import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/common/PageHero";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_main/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ — NATEAT" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <div className="space-y-6">
      <PageHero title="Hồ sơ cá nhân" subtitle={user?.email} />
      <div className="grid gap-6 md:grid-cols-2">
        <form className="rounded-3xl bg-card p-6 shadow-card space-y-4" onSubmit={async (e) => { e.preventDefault(); await updateProfile({ name, phone }); toast.success("Đã cập nhật"); }}>
          <h3 className="font-bold">Thông tin</h3>
          <div><Label>Tên</Label><Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Số điện thoại</Label><Input className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <Button className="rounded-xl">Lưu thay đổi</Button>
        </form>
        <form className="rounded-3xl bg-card p-6 shadow-card space-y-4" onSubmit={async (e) => { e.preventDefault(); try { await changePassword(oldPw, newPw); toast.success("Đổi mật khẩu thành công"); setOldPw(""); setNewPw(""); } catch (err: any) { toast.error(err.message); } }}>
          <h3 className="font-bold">Đổi mật khẩu</h3>
          <div><Label>Mật khẩu hiện tại</Label><Input type="password" className="mt-1.5" value={oldPw} onChange={(e) => setOldPw(e.target.value)} /></div>
          <div><Label>Mật khẩu mới</Label><Input type="password" className="mt-1.5" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
          <Button variant="secondary" className="rounded-xl">Đổi mật khẩu</Button>
        </form>
      </div>
      <Button variant="outline" onClick={() => logout()} className="rounded-xl">Đăng xuất</Button>
    </div>
  );
}
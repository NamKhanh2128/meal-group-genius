import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Đăng ký — NATEAT" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const { refresh } = useGroup();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      await refresh();
      toast.success("Tạo tài khoản thành công! Gia đình mặc định đã được tạo.");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary via-primary-deep to-primary p-6">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elevated animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-warning to-destructive text-white">
            <Plus className="h-5 w-5" strokeWidth={3} />
          </div>
          NATEAT
        </div>
        <h1 className="mt-6 text-2xl font-bold">Tạo tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">Một gia đình 1 thành viên sẽ được tạo tự động cho bạn.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Họ tên</Label><Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label>Email</Label><Input className="mt-1.5" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label>Mật khẩu</Label><Input className="mt-1.5" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary-deep font-semibold">
            {loading ? "Đang tạo…" : "Tạo tài khoản"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Đã có tài khoản? <Link to="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

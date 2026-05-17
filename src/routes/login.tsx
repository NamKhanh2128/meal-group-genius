import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Đăng nhập — NATEAT" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("user@nateat.vn");
  const [pw, setPw] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, pw);
      toast.success(`Chào ${u.name}!`);
      nav({ to: u.role === "admin" ? "/admin/users" : "/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary via-primary-deep to-primary p-6">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elevated">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-warning to-destructive text-white">
            <Plus className="h-5 w-5" strokeWidth={3} />
          </div>
          NATEAT
        </div>
        <h1 className="mt-6 text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý tủ lạnh & thực đơn gia đình.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pw">Mật khẩu</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary-deep font-semibold">
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Chưa có tài khoản? <Link to="/register" className="font-semibold text-primary hover:underline">Đăng ký</Link>
        </p>
        <p className="mt-3 text-xs text-center text-muted-foreground">Demo: user@nateat.vn / admin@nateat.vn · mật khẩu bất kỳ</p>
      </div>
    </div>
  );
}
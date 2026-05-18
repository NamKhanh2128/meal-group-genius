import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Home, ShoppingCart, Snowflake, ScrollText, Users, Plus, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { fmtRelative } from "@/utils/dateHelpers";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Trang chủ", Icon: Home },
  { to: "/shopping", label: "Mua sắm", Icon: ShoppingCart },
  { to: "/fridge", label: "Tủ lạnh", Icon: Snowflake },
  { to: "/meal-plan", label: "Thực đơn", Icon: ScrollText },
  { to: "/groups", label: "Gia đình", Icon: Users },
];

export function Header() {
  const { user, logout } = useAuth();
  const { feed } = useGroup();
  const { pathname } = useLocation();
  const nav = useNavigate();

  async function onLogout() {
    await logout();
    toast.success("Đã đăng xuất");
    nav({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/40">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-warning to-destructive text-white shadow-md">
            <Plus className="h-5 w-5" strokeWidth={3} />
          </div>
          <span className="tracking-tight text-foreground">NATEAT</span>
        </Link>

        <nav className="ml-4 flex items-center gap-1">
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"
                }`}>
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary hover:bg-accent transition">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {feed.length > 0 && (
                  <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {Math.min(feed.length, 9)}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b font-semibold">Thông báo</div>
              <ul className="max-h-80 overflow-y-auto">
                {feed.slice(0, 8).map((f) => (
                  <li key={f.id} className="px-4 py-2.5 hover:bg-secondary text-sm border-b last:border-0">
                    <div className="font-medium">{f.userName} <span className="font-normal text-muted-foreground">{f.message}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">{fmtRelative(f.createdAt)}</div>
                  </li>
                ))}
                {feed.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">Chưa có thông báo</li>}
              </ul>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary transition outline-none">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-warning to-warning/60 text-white font-bold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="hidden text-right md:block">
                <div className="text-sm font-semibold leading-tight">{user?.name ?? "Khách"}</div>
                <div className="text-xs text-muted-foreground">{user?.role === "admin" ? "Admin" : "Thành viên"}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav({ to: "/profile" })}>
                <UserIcon className="h-4 w-4 mr-2" /> Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav({ to: "/groups" })}>
                <Users className="h-4 w-4 mr-2" /> Gia đình
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => nav({ to: "/admin/users" })}>
                  <Users className="h-4 w-4 mr-2" /> Quản trị
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

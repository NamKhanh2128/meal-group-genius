import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Home, ShoppingCart, Snowflake, ScrollText, Users, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Trang chủ", Icon: Home },
  { to: "/shopping", label: "Mua sắm", Icon: ShoppingCart },
  { to: "/fridge", label: "Tủ lạnh", Icon: Snowflake },
  { to: "/meal-plan", label: "Thực đơn", Icon: ScrollText },
  { to: "/groups", label: "Gia đình", Icon: Users },
];

export function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border/40">
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
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary hover:bg-accent transition">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              3
            </span>
          </button>
          <Link to="/profile" className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary transition">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-warning to-warning/60 text-white font-bold">
              {user?.name?.[0] ?? "U"}
            </div>
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold leading-tight">{user?.name ?? "Khách"}</div>
              <div className="text-xs text-muted-foreground">{user?.role === "admin" ? "Admin" : "Thành viên"}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
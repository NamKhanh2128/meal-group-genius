import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Users2,
  UtensilsCrossed,
  BookOpen,
  CalendarDays,
  BarChart3,
  Settings,
  ShoppingBag,
  Refrigerator,
  Activity,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/authStore";
import { useT } from "@/store/languageStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppModal } from "@/components/shared/AppModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TranslationKey } from "@/lib/i18n";

const navItems: { to: string; labelKey: TranslationKey; icon: React.ElementType }[] = [
  { to: "/dashboard", labelKey: "adminDashboard", icon: LayoutDashboard },
  { to: "/users", labelKey: "adminUsers", icon: Users },
  { to: "/families", labelKey: "adminFamilies", icon: Users2 },
  { to: "/shopping-lists", labelKey: "adminShoppingLists", icon: ShoppingBag },
  { to: "/inventories", labelKey: "adminInventories", icon: Refrigerator },
  { to: "/foods", labelKey: "adminFoods", icon: UtensilsCrossed },
  { to: "/recipes", labelKey: "adminRecipes", icon: BookOpen },
  { to: "/meals", labelKey: "adminMeals", icon: CalendarDays },
  { to: "/statistics", labelKey: "adminStatistics", icon: BarChart3 },
  { to: "/activities", labelKey: "adminActivities", icon: Activity },
  { to: "/settings", labelKey: "adminSettings", icon: Settings },
];

export function AdminHeader() {
  const user = useAdminAuthStore((state) => state.user);
  const logout = useAdminAuthStore((state) => state.logout);
  const t = useT();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[68px] w-full items-center justify-between bg-[#fbfbfe]/90 backdrop-blur-md px-6 shadow-sm border-b border-border/40">
        {/* Left: Brand Logo & Text */}
        <div className="flex items-center shrink-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffb11f] text-white">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-lg font-extrabold tracking-wide text-[#5b368d]">
            NATEAT Admin
          </span>
        </div>

        {/* Center: Navigation Links (visible on md and wider) */}
        <nav className="hidden md:flex items-center flex-1 justify-evenly max-w-xl mx-8">
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex h-10 w-10 items-center justify-center rounded-[12px] transition duration-200 ease-in-out ${
                      isActive
                        ? "bg-[#eee9f7] text-[#65439a] shadow-[inset_0_-3px_0_#ffb11f]"
                        : "text-[#9790a6] hover:bg-[#f1edf7] hover:text-[#65439a]"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t(item.labelKey)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger (visible below md) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="md:hidden grid h-10 w-10 place-items-center rounded-xl text-[#91889f] transition duration-200 hover:bg-[#f1eef8] hover:text-[#65439a]"
            title="Menu"
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Profile Avatar */}
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="cursor-pointer transition hover:scale-105 active:scale-95"
            title={t("profile")}
          >
            <Avatar className="h-9 w-9 bg-[#ffbd2c] text-[#4b3178] border border-[#ffbd2c]/30 shadow-sm">
              <AvatarFallback className="text-sm font-extrabold">
                {user?.full_name?.charAt(0).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl text-[#91889f] transition hover:bg-[#f1eef8] hover:text-destructive"
            title="Đăng xuất"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        <AppModal
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          type="confirm"
          title="Đăng xuất khỏi hệ thống?"
          primaryLabel="Đăng xuất"
          secondaryLabel="Hủy"
          onPrimary={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          Phiên làm việc admin của bạn sẽ kết thúc. Bạn cần đăng nhập lại để tiếp tục quản trị.
        </AppModal>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 top-[68px] bg-black/40 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      {drawerOpen && (
        <div className="fixed top-[68px] right-0 bottom-0 w-[280px] bg-[#fbfbfe] shadow-lg border-l border-border z-50 md:hidden overflow-y-auto transition duration-300 ease-in-out">
          <nav className="flex flex-col py-4 px-3 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 h-12 py-3 px-6 text-sm font-semibold rounded-xl transition hover:bg-[#f1edf7] ${
                    isActive
                      ? "bg-[#eee9f7] text-[#65439a] shadow-[inset_0_-3px_0_#ffb11f]"
                      : "text-[#9790a6] hover:text-[#65439a]"
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

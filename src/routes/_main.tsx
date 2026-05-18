import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/common/Header";
import { authService } from "@/services/auth.service";
import { seedIfEmpty } from "@/services/seed";

export const Route = createFileRoute("/_main")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      seedIfEmpty();
      if (!authService.current()) throw redirect({ to: "/login" });
    }
  },
  component: MainLayout,
});

function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main key={pathname} className="mx-auto max-w-[1400px] px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Outlet />
      </main>
    </div>
  );
}

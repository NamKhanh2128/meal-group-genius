import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/common/Header";
import { authService } from "@/services/auth.service";
import { seedIfEmpty } from "@/services/seed";

export const Route = createFileRoute("/_main")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      seedIfEmpty();
      if (!authService.current()) {
        throw redirect({ to: "/login" });
      }
    }
  },
  component: MainLayout,
});

function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
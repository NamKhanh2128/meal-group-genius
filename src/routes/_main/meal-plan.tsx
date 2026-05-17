import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/common/PageHero";

export const Route = createFileRoute("/_main/meal-plan")({
  head: () => ({ meta: [{ title: "Thực đơn — NATEAT" }] }),
  component: () => (
    <div className="space-y-6">
      <PageHero title="Thực đơn tuần 📅" subtitle="Lên kế hoạch bữa Sáng / Trưa / Tối cho cả tuần" />
      <div className="rounded-3xl bg-card p-10 text-center shadow-card">
        <p className="text-muted-foreground">Tính năng đang được hoàn thiện — quét tủ lạnh, gợi ý món, tự tạo danh sách mua bổ sung.</p>
      </div>
    </div>
  ),
});
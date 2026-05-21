import { MailPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { AppModal } from "@/shared/components/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { familyApi } from "@/modules/family/api/familyApi";
import { shoppingApi, type ShoppingListDetail } from "@/modules/shopping/api/shoppingApi";
import type { FamilyActivity, User } from "@/types";
import { relativeTime } from "@/shared/utils/date";

export function FamilyPage() {
  const family = useAuthStore((state) => state.family)!;
  const user = useAuthStore((state) => state.user)!;
  const [members, setMembers] = useState<User[]>([]);
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [shoppingTasks, setShoppingTasks] = useState<ShoppingListDetail[]>([]);
  const [email, setEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [incomingOpen, setIncomingOpen] = useState(false);

  async function reload() {
    const [familyData, lists] = await Promise.all([familyApi.detail(family.family_id), shoppingApi.list(family.family_id)]);
    setMembers(familyData.members);
    setActivities(familyData.activities);
    setShoppingTasks(lists.filter((list) => list.status !== "DONE"));
  }

  useEffect(() => { void reload(); }, [family.family_id]);

  async function addMember() {
    await familyApi.addMember(family.family_id, email);
    setEmail("");
    toast.success("Đã gửi lời mời/thêm thành viên vào gia đình.");
    await reload();
  }

  async function respondTask(shoppingListId: string, status: "accepted" | "rejected") {
    await familyApi.respondShoppingTask(family.family_id, shoppingListId, user.user_id, status);
    toast.success(status === "accepted" ? "Đã nhận nhiệm vụ mua hàng." : "Đã từ chối nhiệm vụ mua hàng.");
    await reload();
  }

  async function reassignTask(shoppingListId: string, userId: string) {
    await familyApi.assignShoppingTask(family.family_id, shoppingListId, userId, user.user_id);
    toast.success("Đã phân công lại nhiệm vụ mua hàng.");
    await reload();
  }

  return (
    <>
      <ScreenHeader title="Nhóm gia đình" subtitle={`${family.family_name}. Module này quản lý nhận mua, từ chối mua và reassign shopping task.`} actions={<Button className="bg-[#ffb11f]" onClick={() => setInviteOpen(true)}><MailPlus className="mr-2 h-4 w-4" />Mời thành viên</Button>} />
      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <div className="rounded-[8px] bg-white p-5 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 font-extrabold"><Users /> Thành viên</h3>
            <div className="space-y-2">{members.map((member, index) => <div key={member.user_id} className="rounded-[8px] bg-[#f8f6fb] p-3"><b>{member.full_name}</b><p className="text-xs text-[#746d82]">{member.email}</p><span className="mt-2 inline-block rounded-full bg-[#eee9f7] px-2 py-1 text-xs font-bold text-[#7655aa]">{index === 0 ? "owner" : "member"}</span></div>)}</div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => setIncomingOpen(true)}>Xem invitation popup</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[8px] bg-white p-5 shadow-card">
            <h3 className="font-extrabold">Buying task assignment</h3>
            <div className="mt-4 space-y-3">
              {shoppingTasks.map((task) => (
                <div key={task.shopping_list_id} className="rounded-[8px] border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <b>{task.title}</b>
                      <p className="text-xs text-[#746d82]">{task.items.length} items · Assigned: {members.find((member) => member.user_id === task.assigned_user_id)?.full_name ?? "Chưa phân công"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => respondTask(task.shopping_list_id, "accepted")}>Nhận mua</Button>
                      <Button variant="outline" onClick={() => respondTask(task.shopping_list_id, "rejected")}>Từ chối mua</Button>
                      <Select value={task.assigned_user_id ?? ""} onValueChange={(value) => reassignTask(task.shopping_list_id, value)}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Reassign" /></SelectTrigger>
                        <SelectContent>{members.map((member) => <SelectItem key={member.user_id} value={member.user_id}>{member.full_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              {shoppingTasks.length === 0 && <p className="text-sm text-[#746d82]">Không có buying task đang mở.</p>}
            </div>
          </div>

          <div className="rounded-[8px] bg-white p-5 shadow-card">
            <h3 className="font-extrabold">Hoạt động gia đình</h3>
            <div className="mt-4 space-y-3">{activities.map((activity) => <div key={activity.id} className="rounded-[8px] border p-3"><b>{members.find((item) => item.user_id === activity.user_id)?.full_name ?? "Thành viên"}</b><p className="text-sm">{activity.message}</p><p className="text-xs text-[#9188a1]">{relativeTime(activity.created_at)} · {activity.status ?? "done"}</p></div>)}</div>
          </div>
        </div>
      </section>
      <AppModal open={inviteOpen} onOpenChange={setInviteOpen} type="confirm" title="Gửi lời mời" primaryLabel="Gửi lời mời" secondaryLabel="Đóng" onPrimary={addMember}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email input" />
      </AppModal>
      <AppModal open={incomingOpen} onOpenChange={setIncomingOpen} type="info" title="Lời mời tham gia gia đình" primaryLabel="Chấp nhận" secondaryLabel="Từ chối" onPrimary={() => toast.success("Đã chấp nhận lời mời.")}>
        Bạn có lời mời tham gia một nhóm gia đình.
      </AppModal>
    </>
  );
}

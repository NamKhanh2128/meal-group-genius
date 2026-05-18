import { MailPlus, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import { BackButton } from "@/components/common/PageActions";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { familyApi } from "@/services/api/familyApi";
import type { FamilyActivity, User } from "@/types";
import { relativeTime } from "@/utils/date";

export function FamilyPage() {
  const family = useAuthStore((state) => state.family)!;
  const [members, setMembers] = useState<User[]>([]);
  const [activities, setActivities] = useState<FamilyActivity[]>([]);
  const [email, setEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [incomingOpen, setIncomingOpen] = useState(false);
  async function reload() {
    const data = await familyApi.detail(family.family_id);
    setMembers(data.members);
    setActivities(data.activities);
  }
  useEffect(() => { void reload(); }, [family.family_id]);
  async function addMember() {
    await familyApi.addMember(family.family_id, email);
    setEmail("");
    toast.success("Đã gửi lời mời/thêm thành viên vào gia đình.");
    await reload();
  }
  return (
    <>
      <ScreenHeader title="Nhóm gia đình" subtitle={`${family.family_name}. Hiển thị members, roles và pending invites.`} actions={<div className="flex gap-2"><BackButton /><Button onClick={() => toast.info("Tạo nhóm mới sẽ gọi API /families.")}>Tạo nhóm</Button><Button className="bg-[#ffb11f]" onClick={() => setInviteOpen(true)}><MailPlus className="mr-2 h-4 w-4" />Mời thành viên</Button></div>} />
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-[8px] bg-white p-5 shadow-card"><h3 className="mb-4 flex items-center gap-2 font-extrabold"><Users /> Thành viên</h3><div className="space-y-2">{members.map((member, index) => <div key={member.user_id} className="rounded-[8px] bg-[#f8f6fb] p-3"><b>{member.full_name}</b><p className="text-xs text-[#746d82]">{member.email}</p><span className="mt-2 inline-block rounded-full bg-[#eee9f7] px-2 py-1 text-xs font-bold text-[#7655aa]">{index === 0 ? "owner" : "member"}</span></div>)}</div><Button variant="outline" className="mt-4 w-full" onClick={() => setIncomingOpen(true)}>Xem invitation popup</Button></div>
        <div className="rounded-[8px] bg-white p-5 shadow-card"><h3 className="font-extrabold">Hoạt động gia đình</h3><div className="mt-4 space-y-3">{activities.map((activity) => <div key={activity.id} className="rounded-[8px] border p-3"><b>{members.find((item) => item.user_id === activity.user_id)?.full_name ?? "Thành viên"}</b><p className="text-sm">{activity.message}</p><p className="text-xs text-[#9188a1]">{relativeTime(activity.created_at)}</p></div>)}</div></div>
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

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/app/store/authStore";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { AppModal } from "@/components/modal/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordSchema, profileSchema } from "../schemas";

type Values = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof changePasswordSchema>;

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)!;
  const family = useAuthStore((state) => state.family);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user.full_name, email: user.email, phone: user.phone ?? "", avatar_url: user.avatar_url ?? "" },
  });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: Values) {
    await updateProfile(values);
    toast.success("Đã cập nhật hồ sơ.");
  }

  async function submitPassword(values: PasswordValues) {
    await changePassword({ old_password: values.old_password, new_password: values.new_password });
    passwordForm.reset();
    setPasswordOpen(false);
    toast.success("Đã đổi mật khẩu.");
  }

  return (
    <>
      <ScreenHeader title="Hồ sơ người dùng" subtitle={`Gia đình hiện tại: ${family?.family_name ?? "Chưa có"}`} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4 rounded-[8px] bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#ffbd2c] text-3xl font-extrabold text-[#4b3178]">{user.full_name.slice(0, 1)}</div>
          <Input placeholder="Avatar URL" {...register("avatar_url")} />
        </div>
        <Input placeholder="Fullname" {...register("full_name")} />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        <Input placeholder="Phone" {...register("phone")} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        <Input placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        <div className="flex flex-wrap gap-2">
          <Button disabled={isSubmitting} className="rounded-[8px] bg-[#7655aa]"><Save className="mr-2 h-4 w-4" />Lưu</Button>
          <Button type="button" variant="outline" onClick={() => setPasswordOpen(true)}><KeyRound className="mr-2 h-4 w-4" />Đổi mật khẩu</Button>
        </div>
      </form>
      <AppModal open={passwordOpen} onOpenChange={setPasswordOpen} type="confirm" title="Đổi mật khẩu" primaryLabel="Cập nhật" secondaryLabel="Hủy" onPrimary={passwordForm.handleSubmit(submitPassword)}>
        <div className="space-y-3">
          <Input type="password" placeholder="Mật khẩu cũ" {...passwordForm.register("old_password")} />
          {passwordForm.formState.errors.old_password && <p className="text-xs text-destructive">{passwordForm.formState.errors.old_password.message}</p>}
          <Input type="password" placeholder="Mật khẩu mới" {...passwordForm.register("new_password")} />
          {passwordForm.formState.errors.new_password && <p className="text-xs text-destructive">{passwordForm.formState.errors.new_password.message}</p>}
          <Input type="password" placeholder="Xác nhận mật khẩu" {...passwordForm.register("confirm_password")} />
          {passwordForm.formState.errors.confirm_password && <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm_password.message}</p>}
        </div>
      </AppModal>
    </>
  );
}

import { ArrowLeft, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function BackButton({ label = "Quay lại" }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <Button type="button" variant="outline" className="rounded-[8px]" onClick={() => navigate(-1)}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" className="rounded-[8px]" onClick={onClick}>
      <RotateCw className="mr-2 h-4 w-4" />
      Refresh
    </Button>
  );
}

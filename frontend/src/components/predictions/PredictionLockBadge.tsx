import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

interface PredictionLockBadgeProps {
  locked: boolean;
  compact?: boolean;
}

export function PredictionLockBadge({
  locked,
  compact = false,
}: PredictionLockBadgeProps) {
  if (locked) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="h-3 w-3" />
        {!compact && "Locked"}
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1">
      <Unlock className="h-3 w-3" />
      {!compact && "Open"}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InviteToken } from "@/types";
import { format } from "date-fns";
import { Copy, Trash2, CheckCircle, Clock, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface InviteListProps {
  invites: InviteToken[];
  onDelete: (id: string) => void;
}

export function InviteList({ invites, onDelete }: InviteListProps) {
  const { addToast } = useToast();

  function copyInviteUrl(token: string) {
    const url = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast("Invite link copied!", "success");
    });
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No invites created yet</p>
        <p className="text-xs mt-1">Create your first invite to add friends</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => {
        const isUsed = !!invite.used_by;
        const isExpired =
          !isUsed && new Date(invite.expires_at) < new Date();

        return (
          <div
            key={invite.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/50 p-3 transition-colors",
              isUsed
                ? "bg-green-950/10"
                : isExpired
                  ? "bg-red-950/10 opacity-60"
                  : "bg-muted/20"
            )}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isUsed
                    ? "bg-green-500/20"
                    : isExpired
                      ? "bg-red-500/20"
                      : "bg-gold/20"
                )}
              >
                {isUsed ? (
                  <UserCheck className="h-4 w-4 text-green-400" />
                ) : isExpired ? (
                  <Clock className="h-4 w-4 text-red-400" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-gold" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono truncate text-muted-foreground">
                  {invite.token.slice(0, 20)}...
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {isUsed ? (
                    <Badge variant="success">
                      Used by @{invite.used_by_username}
                    </Badge>
                  ) : isExpired ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="gold">Available</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Created {format(new Date(invite.created_at), "MMM d, HH:mm")}
                  </span>
                  {!isUsed && !isExpired && (
                    <span className="text-xs text-muted-foreground">
                      Expires{" "}
                      {format(new Date(invite.expires_at), "MMM d, HH:mm")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isUsed && !isExpired && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteUrl(invite.token)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(invite.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

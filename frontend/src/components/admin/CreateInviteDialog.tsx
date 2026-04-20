import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createInvite } from "@/services/admin";
import type { InviteToken } from "@/types";
import { Loader2, Plus } from "lucide-react";

interface CreateInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (invite: InviteToken) => void;
}

export function CreateInviteDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateInviteDialogProps) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const invite = await createInvite({ expires_in_days: expiresInDays });
      onCreated(invite);
    } catch {
      setError("Failed to create invite. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Create New Invite</DialogTitle>
          <DialogDescription>
            Generate an invite link to share with a friend. Each link can only be
            used once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expires">Expires in (days)</Label>
            <Input
              id="expires"
              type="number"
              min={1}
              max={30}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              The invite will expire after this many days.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleCreate} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

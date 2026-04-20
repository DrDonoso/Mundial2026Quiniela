import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { InviteList } from "@/components/admin/InviteList";
import { CreateInviteDialog } from "@/components/admin/CreateInviteDialog";
import { getInvites, deleteInvite } from "@/services/admin";
import { Button } from "@/components/ui/button";
import type { InviteToken } from "@/types";
import { Shield, Plus, Users, Link as LinkIcon } from "lucide-react";

export default function AdminPage() {
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchInvites();
  }, []);

  async function fetchInvites() {
    setLoading(true);
    try {
      const data = await getInvites();
      setInvites(data);
    } catch {
      addToast("Failed to load invites", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteInvite(id);
      setInvites((prev) => prev.filter((i) => i.id !== id));
      addToast("Invite revoked", "success");
    } catch {
      addToast("Failed to revoke invite", "error");
    }
  }

  function handleInviteCreated(invite: InviteToken) {
    setInvites((prev) => [invite, ...prev]);
    setShowCreateDialog(false);
    addToast("Invite created!", "success");
  }

  const usedCount = invites.filter((i) => i.used_by).length;
  const pendingCount = invites.filter((i) => !i.used_by).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-gold" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage invitations and system settings
          </p>
        </div>
        <Button variant="gold" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invite
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invites</p>
                <p className="text-2xl font-bold">{invites.length}</p>
              </div>
              <LinkIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-2xl font-bold text-pitch-light">
                  {usedCount}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-gold">{pendingCount}</p>
              </div>
              <Plus className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite List */}
      <Card className="glass border-border/30">
        <CardHeader>
          <CardTitle>Invite Tokens</CardTitle>
          <CardDescription>
            Create invite links to add friends to the pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <InviteList invites={invites} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      <CreateInviteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleInviteCreated}
      />
    </div>
  );
}

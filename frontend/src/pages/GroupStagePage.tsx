import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { GroupPredictionCard } from "@/components/predictions/GroupPredictionCard";
import { getGroups } from "@/services/tournament";
import { getGroupPredictions } from "@/services/predictions";
import type { GroupWithTeams, GroupStagePrediction } from "@/types";
import { Users } from "lucide-react";

export default function GroupStagePage() {
  const [groups, setGroups] = useState<GroupWithTeams[]>([]);
  const [predictions, setPredictions] = useState<GroupStagePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsData, predsData] = await Promise.all([
          getGroups(),
          getGroupPredictions().catch(() => []),
        ]);
        setGroups(groupsData.sort((a, b) => a.letter.localeCompare(b.letter)));
        setPredictions(predsData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handlePredictionSaved(groupId: string, newPreds: GroupStagePrediction[]) {
    setPredictions((prev) => {
      const filtered = prev.filter((p) => p.group_id !== groupId);
      return [...filtered, ...newPreds];
    });
    addToast("Group prediction saved!", "success");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-pitch-light" />
          Group Stage Predictions
        </h1>
        <p className="text-muted-foreground mt-1">
          Pick 1st and 2nd place for each group. Max{" "}
          <span className="text-gold font-bold">120 points</span> (10 per
          group).
        </p>
      </div>

      {groups.length === 0 ? (
        <Card className="glass border-border/30">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No groups available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Groups will be loaded once tournament data is synced from the API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const groupPreds = predictions.filter(
              (p) => p.group_id === group.id
            );
            return (
              <GroupPredictionCard
                key={group.id}
                group={group}
                predictions={groupPreds}
                onSaved={(newPreds) =>
                  handlePredictionSaved(group.id, newPreds)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PredictionLockBadge } from "./PredictionLockBadge";
import { updateGroupPredictions } from "@/services/predictions";
import { cn } from "@/lib/utils";
import type { GroupWithTeams, GroupStagePrediction } from "@/types";
import { Save, Loader2, Medal, Trophy } from "lucide-react";

interface GroupPredictionCardProps {
  group: GroupWithTeams;
  predictions: GroupStagePrediction[];
  onSaved: (predictions: GroupStagePrediction[]) => void;
}

export function GroupPredictionCard({
  group,
  predictions,
  onSaved,
}: GroupPredictionCardProps) {
  const isLocked = predictions.some((p) => p.locked);
  const [firstPlace, setFirstPlace] = useState(
    predictions.find((p) => p.predicted_position === 1)?.team_id || ""
  );
  const [secondPlace, setSecondPlace] = useState(
    predictions.find((p) => p.predicted_position === 2)?.team_id || ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!firstPlace || !secondPlace || isLocked) return;
    setSaving(true);
    try {
      const result = await updateGroupPredictions(group.id, {
        first_place_team_id: firstPlace,
        second_place_team_id: secondPlace,
      });
      onSaved(result);
    } finally {
      setSaving(false);
    }
  }

  const teams = group.teams || [];
  const hasChanges =
    firstPlace !== (predictions.find((p) => p.predicted_position === 1)?.team_id || "") ||
    secondPlace !== (predictions.find((p) => p.predicted_position === 2)?.team_id || "");

  return (
    <Card className="glass border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pitch-light to-pitch text-sm font-bold text-gold">
              {group.letter}
            </span>
            Group {group.letter}
          </CardTitle>
          <PredictionLockBadge locked={isLocked} compact />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 1st Place Selection */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <Trophy className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-medium text-muted-foreground">
              1st Place (5 pts)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {teams.map((gt) => (
              <button
                key={gt.team_id}
                disabled={isLocked || gt.team_id === secondPlace}
                onClick={() => setFirstPlace(gt.team_id)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium transition-all",
                  firstPlace === gt.team_id
                    ? "border-gold bg-gold/10 text-gold-light shadow-sm"
                    : "border-border hover:border-border/80 hover:bg-muted",
                  (isLocked || gt.team_id === secondPlace) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                <img
                  src={gt.team.flag_url}
                  alt={gt.team.code}
                  className="h-3.5 w-5 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="truncate">{gt.team.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2nd Place Selection */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <Medal className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium text-muted-foreground">
              2nd Place (5 pts exact / 2 pts partial)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {teams.map((gt) => (
              <button
                key={gt.team_id}
                disabled={isLocked || gt.team_id === firstPlace}
                onClick={() => setSecondPlace(gt.team_id)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium transition-all",
                  secondPlace === gt.team_id
                    ? "border-gray-400 bg-gray-400/10 text-gray-300 shadow-sm"
                    : "border-border hover:border-border/80 hover:bg-muted",
                  (isLocked || gt.team_id === firstPlace) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                <img
                  src={gt.team.flag_url}
                  alt={gt.team.code}
                  className="h-3.5 w-5 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="truncate">{gt.team.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        {!isLocked && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleSave}
            disabled={saving || !firstPlace || !secondPlace || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Save className="h-3 w-3 mr-1" />
            )}
            Save
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

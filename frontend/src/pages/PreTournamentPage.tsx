import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { TeamSelector } from "@/components/predictions/TeamSelector";
import { PredictionLockBadge } from "@/components/predictions/PredictionLockBadge";
import { getPreTournament, updatePreTournament } from "@/services/predictions";
import { getTeams } from "@/services/tournament";
import { Button } from "@/components/ui/button";
import type {
  Team,
  PreTournamentPrediction,
  PreTournamentPredictionType,
} from "@/types";
import {
  Trophy,
  Target,
  ShieldAlert,
  AlertTriangle,
  Save,
  Loader2,
} from "lucide-react";

const predictionCategories: {
  type: PreTournamentPredictionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  maxPoints: number;
}[] = [
  {
    type: "champion",
    label: "World Champion",
    description: "Which team will lift the trophy?",
    icon: <Trophy className="h-6 w-6 text-gold" />,
    maxPoints: 50,
  },
  {
    type: "most_goals_scored",
    label: "Most Goals Scored",
    description: "Which team will score the most goals in the tournament?",
    icon: <Target className="h-6 w-6 text-pitch-light" />,
    maxPoints: 30,
  },
  {
    type: "most_goals_conceded",
    label: "Most Goals Conceded",
    description: "Which team will concede the most goals?",
    icon: <ShieldAlert className="h-6 w-6 text-mundial-red" />,
    maxPoints: 30,
  },
  {
    type: "most_red_cards",
    label: "Most Red Cards",
    description: "Which team will collect the most red cards?",
    icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
    maxPoints: 30,
  },
];

export default function PreTournamentPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [predictions, setPredictions] = useState<PreTournamentPrediction[]>([]);
  const [selections, setSelections] = useState<
    Record<PreTournamentPredictionType, string>
  >({
    champion: "",
    most_goals_scored: "",
    most_goals_conceded: "",
    most_red_cards: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, predictionsData] = await Promise.all([
          getTeams(),
          getPreTournament().catch(() => []),
        ]);
        setTeams(teamsData);
        setPredictions(predictionsData);

        const locked = predictionsData.some((p) => p.locked);
        setIsLocked(locked);

        const newSelections: Record<PreTournamentPredictionType, string> = {
          champion: "",
          most_goals_scored: "",
          most_goals_conceded: "",
          most_red_cards: "",
        };
        for (const pred of predictionsData) {
          newSelections[pred.prediction_type] = pred.team_id;
        }
        setSelections(newSelections);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSave() {
    if (isLocked) return;
    setSaving(true);
    try {
      await updatePreTournament({
        champion_team_id: selections.champion,
        most_goals_scored_team_id: selections.most_goals_scored,
        most_goals_conceded_team_id: selections.most_goals_conceded,
        most_red_cards_team_id: selections.most_red_cards,
      });
      addToast("Pre-tournament predictions saved!", "success");
    } catch {
      addToast("Failed to save predictions. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  const allSelected = Object.values(selections).every((v) => v !== "");

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gold" />
            Pre-Tournament Predictions
          </h1>
          <p className="text-muted-foreground mt-1">
            Make your big calls before the tournament starts. Max{" "}
            <span className="text-gold font-bold">140 points</span>.
          </p>
        </div>
        <PredictionLockBadge locked={isLocked} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {predictionCategories.map((cat) => {
          const currentPrediction = predictions.find(
            (p) => p.prediction_type === cat.type
          );

          return (
            <Card key={cat.type} className="glass border-border/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    <div>
                      <CardTitle className="text-lg">{cat.label}</CardTitle>
                      <CardDescription>{cat.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="gold">{cat.maxPoints} pts</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <TeamSelector
                  teams={teams}
                  selectedTeamId={selections[cat.type]}
                  onSelect={(teamId) =>
                    setSelections((prev) => ({ ...prev, [cat.type]: teamId }))
                  }
                  disabled={isLocked}
                />
                {currentPrediction && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current pick: {currentPrediction.team.name}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLocked && (
        <div className="flex justify-end">
          <Button
            variant="gold"
            size="lg"
            onClick={handleSave}
            disabled={saving || !allSelected}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Predictions
          </Button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KnockoutBracket } from "@/components/predictions/KnockoutBracket";
import { MatchCard } from "@/components/predictions/MatchCard";
import { getMatches } from "@/services/tournament";
import { getKnockoutPredictions } from "@/services/predictions";
import type { Match, KnockoutPrediction, MatchStage } from "@/types";
import { Swords } from "lucide-react";

const knockoutStages: { value: MatchStage; label: string; points: number }[] = [
  { value: "round_of_32", label: "Round of 32", points: 3 },
  { value: "round_of_16", label: "Round of 16", points: 5 },
  { value: "quarter_final", label: "Quarter-finals", points: 8 },
  { value: "semi_final", label: "Semi-finals", points: 12 },
  { value: "third_place", label: "Third Place", points: 5 },
  { value: "final", label: "Final", points: 15 },
];

export default function KnockoutPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<KnockoutPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesData, predsData] = await Promise.all([
          getMatches().catch(() => []),
          getKnockoutPredictions().catch(() => []),
        ]);
        setMatches(matchesData.filter((m) => m.stage !== "group"));
        setPredictions(predsData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handlePredictionUpdated(pred: KnockoutPrediction) {
    setPredictions((prev) => {
      const filtered = prev.filter((p) => p.match_id !== pred.match_id);
      return [...filtered, pred];
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const knockoutMatches = matches.filter((m) => m.stage !== "group");
  const hasMatches = knockoutMatches.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="h-6 w-6 text-mundial-red" />
          Knockout Stage Predictions
        </h1>
        <p className="text-muted-foreground mt-1">
          Predict the winner of each knockout match. Max{" "}
          <span className="text-gold font-bold">164 points</span>.
        </p>
      </div>

      {!hasMatches ? (
        <Card className="glass border-border/30">
          <CardContent className="py-12 text-center">
            <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No knockout matches yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Knockout bracket will appear after the group stage is completed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="bracket">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="bracket">Bracket View</TabsTrigger>
            <TabsTrigger value="by-round">By Round</TabsTrigger>
          </TabsList>

          <TabsContent value="bracket">
            <KnockoutBracket
              matches={knockoutMatches}
              predictions={predictions}
              onPredictionUpdated={handlePredictionUpdated}
            />
          </TabsContent>

          <TabsContent value="by-round">
            <div className="space-y-6">
              {knockoutStages.map((stage) => {
                const stageMatches = knockoutMatches.filter(
                  (m) => m.stage === stage.value
                );
                if (stageMatches.length === 0) return null;

                return (
                  <div key={stage.value}>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-lg font-semibold">{stage.label}</h2>
                      <Badge variant="gold">{stage.points} pts/match</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {stageMatches.map((match) => {
                        const prediction = predictions.find(
                          (p) => p.match_id === match.id
                        );
                        return (
                          <MatchCard
                            key={match.id}
                            match={match}
                            prediction={prediction}
                            onPredictionUpdated={handlePredictionUpdated}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

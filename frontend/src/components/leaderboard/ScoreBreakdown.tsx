import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { UserScoreDetail } from "@/types";
import { Trophy, Users, Swords, Target, Medal, Hash } from "lucide-react";
import { format } from "date-fns";

interface ScoreBreakdownProps {
  score: UserScoreDetail;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <div className="space-y-4">
      {/* Main score card */}
      <Card className="glass border-border/30 glow-gold">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your Total Score</p>
              <p className="text-5xl font-bold text-gold mt-1">
                {score.total_points}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                out of 424 possible points
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="gold" className="text-lg px-4 py-1">
                <Medal className="h-4 w-4 mr-1" />
                Rank #{score.rank}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {format(new Date(score.last_calculated_at), "MMM d, HH:mm")}
              </p>
            </div>
          </div>
          <Progress
            value={score.total_points}
            max={424}
            variant="gold"
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Phase breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Pre-Tournament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{score.pre_tournament_points}</p>
            <p className="text-xs text-muted-foreground mb-2">/ 140 max (33%)</p>
            <Progress
              value={score.pre_tournament_points}
              max={140}
              variant="gold"
            />
          </CardContent>
        </Card>

        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-pitch-light" />
              Group Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{score.group_stage_points}</p>
            <p className="text-xs text-muted-foreground mb-2">/ 120 max (28%)</p>
            <Progress
              value={score.group_stage_points}
              max={120}
              variant="green"
            />
          </CardContent>
        </Card>

        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Swords className="h-4 w-4 text-mundial-red" />
              Knockout Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{score.knockout_points}</p>
            <p className="text-xs text-muted-foreground mb-2">/ 164 max (39%)</p>
            <Progress value={score.knockout_points} max={164} />
          </CardContent>
        </Card>
      </div>

      {/* Tiebreaker stats */}
      <Card className="glass border-border/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-gold" />
            Tiebreaker Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Hash className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {score.correct_knockout_predictions}
              </p>
              <p className="text-xs text-muted-foreground">
                Correct knockout picks
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-center">
              <Target className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xl font-bold">
                {score.exact_group_positions}
              </p>
              <p className="text-xs text-muted-foreground">
                Exact group positions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

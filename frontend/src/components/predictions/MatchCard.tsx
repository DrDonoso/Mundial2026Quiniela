import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateKnockoutPrediction } from "@/services/predictions";
import { useToast } from "@/components/ui/toast";
import type { Match, KnockoutPrediction } from "@/types";
import { format } from "date-fns";
import { Check, Loader2 } from "lucide-react";

interface MatchCardProps {
  match: Match;
  prediction?: KnockoutPrediction;
  onPredictionUpdated: (prediction: KnockoutPrediction) => void;
  compact?: boolean;
}

export function MatchCard({
  match,
  prediction,
  onPredictionUpdated,
  compact = false,
}: MatchCardProps) {
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const isLocked = prediction?.locked || match.status === "finished";
  const isLive = match.status === "live";

  async function handleSelectWinner(teamId: string) {
    if (isLocked || saving) return;
    setSaving(true);
    try {
      const result = await updateKnockoutPrediction(match.id, {
        predicted_winner_team_id: teamId,
      });
      onPredictionUpdated(result);
      addToast("Prediction saved!", "success");
    } catch {
      addToast("Failed to save prediction", "error");
    } finally {
      setSaving(false);
    }
  }

  const homeTeam = match.home_team;
  const awayTeam = match.away_team;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-border",
        compact ? "w-48" : "w-full max-w-xs",
        isLive && "border-red-500/50"
      )}
    >
      {/* Match info header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {match.stage.replace(/_/g, " ")}
        </span>
        <div className="flex items-center gap-1">
          {isLive && <Badge variant="live">LIVE</Badge>}
          {match.status === "finished" && (
            <Badge variant="secondary">FT</Badge>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-2 space-y-1">
        {/* Home team */}
        <button
          disabled={isLocked || !homeTeam || saving}
          onClick={() => homeTeam && handleSelectWinner(homeTeam.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-all",
            prediction?.predicted_winner_team_id === match.home_team_id
              ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
              : "hover:bg-muted",
            (isLocked || !homeTeam) && "cursor-default"
          )}
        >
          {homeTeam ? (
            <>
              <img
                src={homeTeam.flag_url}
                alt={homeTeam.code}
                className="h-3.5 w-5 rounded object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="truncate flex-1 text-left">{homeTeam.name}</span>
              {match.home_score !== null && (
                <span className="font-bold tabular-nums">{match.home_score}</span>
              )}
              {prediction?.predicted_winner_team_id === match.home_team_id && (
                <Check className="h-3 w-3 text-primary shrink-0" />
              )}
            </>
          ) : (
            <span className="text-muted-foreground italic">TBD</span>
          )}
          {saving && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
        </button>

        {/* Away team */}
        <button
          disabled={isLocked || !awayTeam || saving}
          onClick={() => awayTeam && handleSelectWinner(awayTeam.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-all",
            prediction?.predicted_winner_team_id === match.away_team_id
              ? "bg-primary/15 text-primary font-semibold ring-1 ring-primary/30"
              : "hover:bg-muted",
            (isLocked || !awayTeam) && "cursor-default"
          )}
        >
          {awayTeam ? (
            <>
              <img
                src={awayTeam.flag_url}
                alt={awayTeam.code}
                className="h-3.5 w-5 rounded object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="truncate flex-1 text-left">{awayTeam.name}</span>
              {match.away_score !== null && (
                <span className="font-bold tabular-nums">{match.away_score}</span>
              )}
              {prediction?.predicted_winner_team_id === match.away_team_id && (
                <Check className="h-3 w-3 text-primary shrink-0" />
              )}
            </>
          ) : (
            <span className="text-muted-foreground italic">TBD</span>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/30 bg-muted/20">
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(match.match_datetime), "MMM d, HH:mm")}
        </span>
        {match.status === "finished" && match.winner_team_id && prediction && (
          <Badge
            variant={
              prediction.predicted_winner_team_id === match.winner_team_id
                ? "success"
                : "destructive"
            }
            className="text-[10px]"
          >
            {prediction.predicted_winner_team_id === match.winner_team_id
              ? "Correct!"
              : "Wrong"}
          </Badge>
        )}
      </div>
    </div>
  );
}

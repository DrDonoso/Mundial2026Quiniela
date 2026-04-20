import { cn } from "@/lib/utils";
import { MatchCard } from "./MatchCard";
import type { Match, KnockoutPrediction, MatchStage } from "@/types";

interface KnockoutBracketProps {
  matches: Match[];
  predictions: KnockoutPrediction[];
  onPredictionUpdated: (prediction: KnockoutPrediction) => void;
}

const stageOrder: MatchStage[] = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
];

const stageLabels: Record<string, string> = {
  round_of_32: "R32",
  round_of_16: "R16",
  quarter_final: "QF",
  semi_final: "SF",
  third_place: "3rd",
  final: "Final",
};

export function KnockoutBracket({
  matches,
  predictions,
  onPredictionUpdated,
}: KnockoutBracketProps) {
  const thirdPlace = matches.filter((m) => m.stage === "third_place");
  const bracketStages = stageOrder.filter((s) => s !== "third_place");

  return (
    <div className="space-y-6">
      {/* Main bracket */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {bracketStages.map((stage) => {
            const stageMatches = matches
              .filter((m) => m.stage === stage)
              .sort((a, b) => a.matchday - b.matchday);

            if (stageMatches.length === 0) return null;

            return (
              <div key={stage} className="flex flex-col">
                <div className="text-center mb-3">
                  <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    {stageLabels[stage]}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex flex-col justify-around gap-3 flex-1",
                    stage === "final" && "justify-center"
                  )}
                >
                  {stageMatches.map((match) => {
                    const prediction = predictions.find(
                      (p) => p.match_id === match.id
                    );
                    return (
                      <MatchCard
                        key={match.id}
                        match={match}
                        prediction={prediction}
                        onPredictionUpdated={onPredictionUpdated}
                        compact
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Third place match */}
      {thirdPlace.length > 0 && (
        <div>
          <div className="text-center mb-3">
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Third Place Match
            </span>
          </div>
          <div className="flex justify-center">
            {thirdPlace.map((match) => {
              const prediction = predictions.find(
                (p) => p.match_id === match.id
              );
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={prediction}
                  onPredictionUpdated={onPredictionUpdated}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

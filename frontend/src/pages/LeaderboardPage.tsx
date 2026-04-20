import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RankingTable } from "@/components/leaderboard/RankingTable";
import { ScoreChart } from "@/components/leaderboard/ScoreChart";
import { ScoreBreakdown } from "@/components/leaderboard/ScoreBreakdown";
import { getLeaderboard, getMyScore, getScoreHistory } from "@/services/leaderboard";
import type { LeaderboardEntry, UserScoreDetail, ScoreHistory } from "@/types";
import { BarChart3, TrendingUp, User } from "lucide-react";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myScore, setMyScore] = useState<UserScoreDetail | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesData, myScoreData, historyData] = await Promise.all([
          getLeaderboard().catch(() => []),
          getMyScore().catch(() => null),
          getScoreHistory().catch(() => []),
        ]);
        setEntries(entriesData);
        setMyScore(myScoreData);
        setHistory(historyData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gold" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          See who&apos;s leading the pack. May the best predictor win.
        </p>
      </div>

      <Tabs defaultValue="rankings">
        <TabsList>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="chart">Score Chart</TabsTrigger>
          <TabsTrigger value="my-score">My Score</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings">
          {entries.length === 0 ? (
            <Card className="glass border-border/30">
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No rankings yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scores will appear once the tournament begins and predictions
                  are scored.
                </p>
              </CardContent>
            </Card>
          ) : (
            <RankingTable entries={entries} />
          )}
        </TabsContent>

        <TabsContent value="chart">
          {history.length === 0 ? (
            <Card className="glass border-border/30">
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No score history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Score progression will be charted daily during the tournament.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  Score Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreChart history={history} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-score">
          {myScore ? (
            <ScoreBreakdown score={myScore} />
          ) : (
            <Card className="glass border-border/30">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium">No score data yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your detailed breakdown will appear once scoring begins.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

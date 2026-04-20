import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Medal,
  Swords,
  Users,
  Star,
} from "lucide-react";
import { getMyScore } from "@/services/leaderboard";
import { getMatches } from "@/services/tournament";
import type { UserScoreDetail, Match } from "@/types";
import { format, isFuture } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [score, setScore] = useState<UserScoreDetail | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [scoreData, matchesData] = await Promise.all([
          getMyScore().catch(() => null),
          getMatches().catch(() => []),
        ]);
        setScore(scoreData);
        setUpcomingMatches(
          matchesData
            .filter((m) => isFuture(new Date(m.match_datetime)))
            .sort(
              (a, b) =>
                new Date(a.match_datetime).getTime() -
                new Date(b.match_datetime).getTime()
            )
            .slice(0, 5)
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          Welcome back,{" "}
          <span className="text-gradient-gold">
            {user?.display_name || user?.username}
          </span>
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your World Cup prediction overview
        </p>
      </div>

      {/* Score Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass border-border/30">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="glass border-border/30 glow-gold">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Total Score</p>
                  <Trophy className="h-5 w-5 text-gold" />
                </div>
                <p className="text-3xl font-bold text-gold">
                  {score?.total_points ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  out of 424 possible points
                </p>
                <Progress
                  value={score?.total_points ?? 0}
                  max={424}
                  variant="gold"
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card className="glass border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Ranking</p>
                  <Medal className="h-5 w-5 text-gold-light" />
                </div>
                <p className="text-3xl font-bold">
                  {score?.rank ? `#${score.rank}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  current position
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Pre-Tournament</p>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold">
                  {score?.pre_tournament_points ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of 140 max points
                </p>
                <Progress
                  value={score?.pre_tournament_points ?? 0}
                  max={140}
                  variant="green"
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card className="glass border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">Knockout</p>
                  <Swords className="h-5 w-5 text-mundial-red" />
                </div>
                <p className="text-3xl font-bold">
                  {score?.knockout_points ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of 164 max points
                </p>
                <Progress
                  value={score?.knockout_points ?? 0}
                  max={164}
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-gold" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/predictions/pre-tournament">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <Trophy className="h-5 w-5 text-gold shrink-0" />
                  <div>
                    <p className="font-medium">Pre-Tournament Predictions</p>
                    <p className="text-xs text-muted-foreground">
                      Champion, top scorer, most red cards
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link to="/predictions/groups">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <Users className="h-5 w-5 text-pitch-light shrink-0" />
                  <div>
                    <p className="font-medium">Group Stage Predictions</p>
                    <p className="text-xs text-muted-foreground">
                      Pick top 2 for all 12 groups
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link to="/predictions/knockout">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <Swords className="h-5 w-5 text-mundial-red shrink-0" />
                  <div>
                    <p className="font-medium">Knockout Predictions</p>
                    <p className="text-xs text-muted-foreground">
                      Predict match winners in the bracket
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <TrendingUp className="h-5 w-5 text-mundial-blue shrink-0" />
                  <div>
                    <p className="font-medium">Leaderboard</p>
                    <p className="text-xs text-muted-foreground">
                      See the rankings and score charts
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-gold" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No upcoming matches scheduled yet</p>
                <p className="text-xs mt-1">
                  Matches will appear once the tournament data is synced
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        {match.home_team ? (
                          <>
                            <img
                              src={match.home_team.flag_url}
                              alt={match.home_team.code}
                              className="h-6 w-8 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <span className="text-xs font-medium mt-0.5">
                              {match.home_team.code}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">TBD</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-bold">
                        vs
                      </span>
                      <div className="flex flex-col items-center">
                        {match.away_team ? (
                          <>
                            <img
                              src={match.away_team.flag_url}
                              alt={match.away_team.code}
                              className="h-6 w-8 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <span className="text-xs font-medium mt-0.5">
                              {match.away_team.code}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">TBD</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {match.stage.replace(/_/g, " ")}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(match.match_datetime), "MMM d, HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score breakdown */}
      {score && (
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-gold" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Pre-Tournament
                </p>
                <p className="text-2xl font-bold text-yellow-500">
                  {score.pre_tournament_points}
                </p>
                <p className="text-xs text-muted-foreground">/ 140 max</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Group Stage
                </p>
                <p className="text-2xl font-bold text-pitch-light">
                  {score.group_stage_points}
                </p>
                <p className="text-xs text-muted-foreground">/ 120 max</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Knockout
                </p>
                <p className="text-2xl font-bold text-mundial-red">
                  {score.knockout_points}
                </p>
                <p className="text-xs text-muted-foreground">/ 164 max</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";
import { Trophy, Medal, Award } from "lucide-react";

interface RankingTableProps {
  entries: LeaderboardEntry[];
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-gold" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return null;
  }
}

function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-gold/5 border-l-2 border-l-gold";
    case 2:
      return "bg-gray-500/5 border-l-2 border-l-gray-400";
    case 3:
      return "bg-amber-900/5 border-l-2 border-l-amber-700";
    default:
      return "";
  }
}

export function RankingTable({ entries }: RankingTableProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center hidden sm:table-cell">
              <span className="text-xs">Pre-Tourn.</span>
            </TableHead>
            <TableHead className="text-center hidden sm:table-cell">
              <span className="text-xs">Groups</span>
            </TableHead>
            <TableHead className="text-center hidden sm:table-cell">
              <span className="text-xs">Knockout</span>
            </TableHead>
            <TableHead className="text-center">
              <span className="text-xs font-bold">Total</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow
              key={entry.user_id}
              className={cn(
                "transition-all animate-rank-up",
                getRankStyle(entry.rank)
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="text-center font-bold">
                <div className="flex items-center justify-center gap-1">
                  {getRankIcon(entry.rank) || (
                    <span className="text-muted-foreground">{entry.rank}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pitch-light to-pitch text-xs font-bold text-gold-light uppercase">
                    {(entry.display_name || entry.username).slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm leading-none">
                      {entry.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{entry.username}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center hidden sm:table-cell">
                <span className="text-sm tabular-nums">
                  {entry.pre_tournament_points}
                </span>
              </TableCell>
              <TableCell className="text-center hidden sm:table-cell">
                <span className="text-sm tabular-nums">
                  {entry.group_stage_points}
                </span>
              </TableCell>
              <TableCell className="text-center hidden sm:table-cell">
                <span className="text-sm tabular-nums">
                  {entry.knockout_points}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={entry.rank <= 3 ? "gold" : "outline"}
                  className="tabular-nums font-bold"
                >
                  {entry.total_points}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

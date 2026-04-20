import api from "./api";
import type { LeaderboardEntry, UserScoreDetail, ScoreHistory } from "@/types";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await api.get<LeaderboardEntry[]>("/leaderboard");
  return response.data;
}

export async function getMyScore(): Promise<UserScoreDetail> {
  const response = await api.get<UserScoreDetail>("/leaderboard/me");
  return response.data;
}

export async function getScoreHistory(): Promise<ScoreHistory[]> {
  const response = await api.get<ScoreHistory[]>("/leaderboard/history");
  return response.data;
}

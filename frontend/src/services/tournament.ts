import api from "./api";
import type { GroupWithTeams, Match, Team, MatchStage, MatchStatus } from "@/types";

export async function getGroups(): Promise<GroupWithTeams[]> {
  const response = await api.get<GroupWithTeams[]>("/tournament/groups");
  return response.data;
}

export async function getMatches(params?: {
  stage?: MatchStage;
  matchday?: number;
  status?: MatchStatus;
}): Promise<Match[]> {
  const response = await api.get<Match[]>("/tournament/matches", { params });
  return response.data;
}

export async function getTeams(): Promise<Team[]> {
  const response = await api.get<Team[]>("/tournament/teams");
  return response.data;
}

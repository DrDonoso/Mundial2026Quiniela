import api from "./api";
import type {
  PreTournamentPrediction,
  PreTournamentPredictionPayload,
  GroupStagePrediction,
  GroupStagePredictionPayload,
  KnockoutPrediction,
  KnockoutPredictionPayload,
} from "@/types";

export async function getPreTournament(): Promise<PreTournamentPrediction[]> {
  const response = await api.get<PreTournamentPrediction[]>("/predictions/pre-tournament");
  return response.data;
}

export async function updatePreTournament(
  data: PreTournamentPredictionPayload
): Promise<PreTournamentPrediction[]> {
  const response = await api.put<PreTournamentPrediction[]>("/predictions/pre-tournament", data);
  return response.data;
}

export async function getGroupPredictions(): Promise<GroupStagePrediction[]> {
  const response = await api.get<GroupStagePrediction[]>("/predictions/groups");
  return response.data;
}

export async function updateGroupPredictions(
  groupId: string,
  data: GroupStagePredictionPayload
): Promise<GroupStagePrediction[]> {
  const response = await api.put<GroupStagePrediction[]>(
    `/predictions/groups/${groupId}`,
    data
  );
  return response.data;
}

export async function getKnockoutPredictions(): Promise<KnockoutPrediction[]> {
  const response = await api.get<KnockoutPrediction[]>("/predictions/knockout");
  return response.data;
}

export async function updateKnockoutPrediction(
  matchId: string,
  data: KnockoutPredictionPayload
): Promise<KnockoutPrediction> {
  const response = await api.put<KnockoutPrediction>(
    `/predictions/knockout/${matchId}`,
    data
  );
  return response.data;
}

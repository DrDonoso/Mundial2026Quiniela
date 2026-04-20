// ─── Auth ──────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  display_name: string;
  invite_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ─── Teams & Groups ───────────────────────────────

export interface Team {
  id: string;
  name: string;
  code: string;
  flag_url: string;
  api_external_id: number;
}

export type GroupLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export interface Group {
  id: string;
  letter: GroupLetter;
}

export interface GroupTeam {
  id: string;
  group_id: string;
  team_id: string;
  team: Team;
  final_position: number | null;
}

export interface GroupWithTeams extends Group {
  teams: GroupTeam[];
}

// ─── Matches ──────────────────────────────────────

export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Match {
  id: string;
  stage: MatchStage;
  group_id: string | null;
  matchday: number;
  home_team_id: string;
  away_team_id: string | null;
  home_team: Team | null;
  away_team: Team | null;
  home_score: number | null;
  away_score: number | null;
  winner_team_id: string | null;
  match_datetime: string;
  status: MatchStatus;
}

// ─── Predictions ──────────────────────────────────

export type PreTournamentPredictionType =
  | "champion"
  | "most_goals_scored"
  | "most_goals_conceded"
  | "most_red_cards";

export interface PreTournamentPrediction {
  id: string;
  user_id: string;
  prediction_type: PreTournamentPredictionType;
  team_id: string;
  team: Team;
  created_at: string;
  locked: boolean;
}

export interface GroupStagePrediction {
  id: string;
  user_id: string;
  group_id: string;
  team_id: string;
  team: Team;
  predicted_position: 1 | 2;
  created_at: string;
  locked: boolean;
}

export interface KnockoutPrediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner_team_id: string;
  predicted_winner_team: Team;
  created_at: string;
  locked: boolean;
}

// ─── Prediction Payloads ──────────────────────────

export interface PreTournamentPredictionPayload {
  champion_team_id: string;
  most_goals_scored_team_id: string;
  most_goals_conceded_team_id: string;
  most_red_cards_team_id: string;
}

export interface GroupStagePredictionPayload {
  first_place_team_id: string;
  second_place_team_id: string;
}

export interface KnockoutPredictionPayload {
  predicted_winner_team_id: string;
}

// ─── Leaderboard ──────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  pre_tournament_points: number;
  group_stage_points: number;
  knockout_points: number;
  total_points: number;
}

export interface UserScoreDetail {
  user_id: string;
  username: string;
  display_name: string;
  rank: number;
  pre_tournament_points: number;
  group_stage_points: number;
  knockout_points: number;
  total_points: number;
  correct_knockout_predictions: number;
  exact_group_positions: number;
  last_calculated_at: string;
}

export interface ScoreHistory {
  date: string;
  total_points: number;
  rank: number;
}

// ─── Admin ────────────────────────────────────────

export interface InviteToken {
  id: string;
  token: string;
  created_by: string;
  created_by_username: string;
  used_by: string | null;
  used_by_username: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface CreateInviteRequest {
  expires_in_days?: number;
}

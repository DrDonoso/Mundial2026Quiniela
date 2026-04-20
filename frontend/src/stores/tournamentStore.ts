import { create } from "zustand";
import type { Team, GroupWithTeams, Match } from "@/types";
import * as tournamentService from "@/services/tournament";

interface TournamentState {
  teams: Team[];
  groups: GroupWithTeams[];
  matches: Match[];
  isLoading: boolean;
  fetchTeams: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  getTeamById: (id: string) => Team | undefined;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  teams: [],
  groups: [],
  matches: [],
  isLoading: false,

  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      const teams = await tournamentService.getTeams();
      set({ teams, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const groups = await tournamentService.getGroups();
      set({ groups, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMatches: async () => {
    set({ isLoading: true });
    try {
      const matches = await tournamentService.getMatches();
      set({ matches, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  getTeamById: (id: string) => {
    return get().teams.find((t) => t.id === id);
  },
}));

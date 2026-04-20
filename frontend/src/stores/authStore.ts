import { create } from "zustand";
import type { User, LoginRequest, RegisterRequest, TokenResponse } from "@/types";
import * as authService from "@/services/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  isAdmin: () => boolean;
}

function storeTokens(tokens: TokenResponse) {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const tokens = await authService.login(data);
      storeTokens(tokens);
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const tokens = await authService.register(data);
      storeTokens(tokens);
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    if (!localStorage.getItem("access_token")) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  isAdmin: () => {
    return get().user?.is_admin ?? false;
  },
}));

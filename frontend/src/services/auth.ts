import api from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/types";

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/login", data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/register", data);
  return response.data;
}

export async function refreshToken(refresh_token: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/refresh", {
    refresh_token,
  });
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

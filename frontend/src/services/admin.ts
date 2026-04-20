import api from "./api";
import type { InviteToken, CreateInviteRequest } from "@/types";

export async function createInvite(
  data?: CreateInviteRequest
): Promise<InviteToken> {
  const response = await api.post<InviteToken>("/admin/invites", data ?? {});
  return response.data;
}

export async function getInvites(): Promise<InviteToken[]> {
  const response = await api.get<InviteToken[]>("/admin/invites");
  return response.data;
}

export async function deleteInvite(id: string): Promise<void> {
  await api.delete(`/admin/invites/${id}`);
}

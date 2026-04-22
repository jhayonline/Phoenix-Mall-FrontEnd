import { backendRequest } from "./client";

export interface OnlineStatusResponse {
  is_online: boolean;
  last_seen: string | null;
  last_seen_relative: string | null;
}

export const onlineStatusApi = {
  heartbeat: () => backendRequest("/online-status/heartbeat", { method: "POST" }),

  getUserStatus: (identifier: number | string) =>
    backendRequest<OnlineStatusResponse>(`/online-status/user/${identifier}`),

  batchUserStatus: (userIds: number[]) =>
    backendRequest<Record<string, { is_online: boolean; last_seen_relative: string | null }>>(
      "/online-status/batch",
      { method: "POST", body: JSON.stringify(userIds) },
    ),
};

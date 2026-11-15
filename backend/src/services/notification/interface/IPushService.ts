// services/notification/interface/IPushService.ts
export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface IPushService {
  sendToUsers(userIds: string[], payload: PushPayload): Promise<void>;
}
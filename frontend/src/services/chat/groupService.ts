import {api} from "../../utils/axiosInterceptor";
import type { Group, GroupMessage } from "../../types/chat/types";

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as {
      response?: { data?: { message?: string } };
    }).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

const groupService = {
  async createGroup(name: string, description: string, memberIds: string[]): Promise<ServiceResponse<Group>> {
    try {
      const res = await api.group.post("/", { name, description, memberIds });
      return { success: true, data: res.data.data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, "Failed to create group") };
    }
  },

  async getMyGroups(): Promise<ServiceResponse<Group[]>> {
    try {
      const res = await api.group.get("/my-groups");
      return { success: true, data: res.data.data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, "Failed to fetch groups") };
    }
  },

  async getGroupMessages(groupId: string): Promise<ServiceResponse<GroupMessage[]>> {
    try {
      const res = await api.group.get(`/${groupId}/messages`);
      return { success: true, data: res.data.data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, "Failed to fetch group messages") };
    }
  },
};

export default groupService;
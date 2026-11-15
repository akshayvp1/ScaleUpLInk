import { api } from "../../utils/axiosInterceptor";

export interface InvestorSummary {
  _id: string;
  name: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  profession?: string;
  role?: string;
  investorDetails?: {
    companyName?: string;
    companyFounded?: number;
  };
  interests?: string[];
  age?: number;
  createdAt?: string;
}

export interface InvestorListResult {
  investors: InvestorSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvestorListParams {
  search?: string;
  sort?: "newest" | "name" | "company";
  page?: number;
  limit?: number;
}

export interface InvestorProfileResult {
  user: InvestorSummary & {
    email?: string;
    contactNumber?: string;
    investorDetails?: {
      companyName?: string;
      companyFounded?: number;
      companyRegistration?: number;
    };
  };
  access: "full" | "limited";
  isConnected: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

const investorService = {
  async discover(params: InvestorListParams = {}): Promise<InvestorListResult> {
    const response = await api.investor.get<ApiEnvelope<InvestorListResult>>(
      "/discover",
      { params }
    );

    return (
      response.data.data ?? {
        investors: [],
        total: 0,
        page: 1,
        limit: params.limit ?? 12,
        totalPages: 1,
      }
    );
  },

  async getProfile(investorId: string): Promise<InvestorProfileResult> {
    const response = await api.investor.get<ApiEnvelope<InvestorProfileResult>>(
      `/profile/${encodeURIComponent(investorId)}`
    );

    return response.data.data;
  },
};

export default investorService;

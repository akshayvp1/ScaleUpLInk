import { IUser } from "../interfaces/IUser";

export interface InvestorDetailsSummary {
  companyName?: string;
  companyFounded?: number;
}

export interface InvestorSummary {
  _id: string;
  name: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  profession?: string;
  role?: string;
  investorDetails?: InvestorDetailsSummary;
  interests?: unknown[];
  age?: number;
  createdAt?: Date;
}

export interface UserView {
  [key: string]: unknown;
}

const toPlain = (user: IUser | UserView): UserView => {
  const candidate = user as { toObject?: () => UserView };
  if (typeof candidate.toObject === "function") {
    return candidate.toObject();
  }
  return user as UserView;
};

const normalizeInvestorDetails = (
  value: unknown
): InvestorDetailsSummary | undefined => {
  if (!value || typeof value !== "object") return undefined;

  const details = value as {
    companyName?: unknown;
    companyFounded?: unknown;
  };

  const summary: InvestorDetailsSummary = {};

  if (typeof details.companyName === "string" && details.companyName.trim()) {
    summary.companyName = details.companyName;
  }

  if (
    typeof details.companyFounded === "number" &&
    Number.isFinite(details.companyFounded)
  ) {
    summary.companyFounded = details.companyFounded;
  }

  return Object.keys(summary).length > 0 ? summary : undefined;
};

export const buildInvestorSummary = (user: IUser): InvestorSummary => {
  const raw = toPlain(user);

  return {
    _id: String(raw._id ?? ""),
    name: String(raw.name ?? ""),
    profileImage: raw.profileImage as string | undefined,
    coverImage: raw.coverImage as string | undefined,
    bio: raw.bio as string | undefined,
    profession: raw.profession as string | undefined,
    role: raw.role as string | undefined,
    investorDetails: normalizeInvestorDetails(raw.investorDetails),
    interests: Array.isArray(raw.interests) ? raw.interests : undefined,
    age: typeof raw.age === "number" ? raw.age : undefined,
    createdAt: raw.createdAt as Date | undefined,
  };
};

/**
 * Builds the public view of a user.
 *
 * When `full` is false (i.e. an investor profile viewed before a connection
 * has been accepted), contact details and the company registration number are
 * removed. Everyone else keeps the existing full payload.
 */
export const buildUserView = (user: IUser, full: boolean): UserView => {
  const raw = toPlain(user);
  delete raw.password;

  if (full) {
    return raw;
  }

  return {
    _id: raw._id,
    name: raw.name,
    profileImage: raw.profileImage,
    coverImage: raw.coverImage,
    bio: raw.bio,
    profession: raw.profession,
    role: raw.role,
    investorDetails: normalizeInvestorDetails(raw.investorDetails),
    interests: raw.interests,
    age: raw.age,
    isPremium: raw.isPremium,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

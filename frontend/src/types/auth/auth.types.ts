



export enum UserRole {
    INVESTOR = "investor",
    ADMIN = "admin",
    ENTREPRENEUR = "entrepreneur"
  }
  
  export interface IUser {
    id?: string;
    name?: string | null;
    email: string;
    password?: string;
    role?: UserRole | null;
    token?: string;
    
    // Profile details
    profession?: string;
    profileImage?: string;
    contactNumber?: string;
    bio?: string;
    age?: number;
  
    // Company details (for investors/entrepreneurs)
    investorDetails?: {
      companyFounded?: number;
      companyName?: string;
      companyRegistration?: number;
    };
  
    // Social and platform-specific fields
    interests?: string[];
    savedPost?: string[];
    followers?: string[];
    following?: string[];
  
    // Account status
    isBlocked?: boolean;
    isActive?: boolean;
    isPremium?: boolean;
    plan?: {
      type: "free" | "premium";
    };
  
    // Metadata
    createdAt?: Date;
    updatedAt?: Date;
    coverImage?: string;
    walletId?: string;
  }
  
  // Authentication State Interface
  export interface AuthState {
    user: IUser | null;
    name: string | null;
    email: string |null;
    role: UserRole | null;
    token: string | null;
    isAuthenticated: boolean;
    profession?: string|null;
  }
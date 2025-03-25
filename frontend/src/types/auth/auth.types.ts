export enum UserRole {
    INVESTOR = "investor",
    ADMIN = "admin",
    ENTREPRENEUR = "entrepreneur",
}

export interface IUser {
    id:string,
    name:string
    email: string;
    password?: string;
    role: UserRole | null;
    token?: string;
    profession?:string;
}

export interface AuthState {
    name:string
    user: IUser | null;
    email: string;
    role: UserRole | null;
    token: string | null;
    isAuthenticated: boolean;
    profession?:string
}
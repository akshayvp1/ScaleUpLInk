import { IUser } from "../../../interfaces/IUser";

export interface InvestorListOptions {
    search?: string;
    sort?: "newest" | "name" | "company";
    page: number;
    limit: number;
    excludeId?: string;
}

export interface InvestorListResult {
    investors: IUser[];
    total: number;
}

export interface IInvestorRepository {
    findInvestorById(id: string): Promise<IUser | null>;
    listInvestors(options: InvestorListOptions): Promise<InvestorListResult>;
}

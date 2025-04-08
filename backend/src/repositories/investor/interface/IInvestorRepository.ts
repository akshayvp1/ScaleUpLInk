import { IUser } from "../../../interfaces/IUser";

export interface IInvestorRepository {
    findInvestorById(id: string): Promise<IUser | null>;
}
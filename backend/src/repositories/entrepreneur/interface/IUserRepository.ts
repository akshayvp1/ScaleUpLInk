import { IUser } from "../../../interfaces/IUser";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
}

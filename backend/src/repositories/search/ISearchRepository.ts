import { IUser } from "../../interfaces/IUser";

export interface ISearchRepository {
  searchUsers(query: string, currentUserId: string, limit?: number): Promise<IUser[]>;
}
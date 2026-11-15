import { IUser } from "../../interfaces/IUser";

export interface ISearchService {
  searchUsers(query: string, currentUserId: string): Promise<IUser[]>;
}
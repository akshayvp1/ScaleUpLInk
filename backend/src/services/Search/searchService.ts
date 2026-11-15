import { inject, injectable } from "tsyringe";
import { ISearchService } from "./ISearchService";
import { ISearchRepository } from "../../repositories/search/ISearchRepository";
import { IUser } from "../../interfaces/IUser";

@injectable()
class SearchService implements ISearchService {
  constructor(
    @inject("SearchRepository") private searchRepository: ISearchRepository
  ) {}

  // Business logic lives here. It returns data or throws — it never
  // touches req/res, which keeps this layer testable without Express.
  searchUsers = async (query: string, currentUserId: string): Promise<IUser[]> => {
    return this.searchRepository.searchUsers(query, currentUserId);
  };
}

export default SearchService;
import { api } from "../../utils/axiosInterceptor";

// Shape of the query you send to the API
export interface SearchParams {
  name: string;
}

// Shape of a single result as exposed to the rest of the app — always
// has `id`, regardless of what the backend calls its identifier field.
export interface SearchResult {
  id: string;
  name: string;
  profileImage: string;
}

// Shape of a single result exactly as the backend sends it (Mongoose
// documents use `_id`, not `id`). Kept private to this file — nothing
// outside searchService should ever see `_id`.
interface RawSearchResult {
  _id: string;
  name: string;
  profileImage: string;
}

// Your controller responds with { success, data }, not the bare array,
// so the generic on api.shared.get has to describe that envelope —
// not the array directly — or the type lies about the real shape.
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Contract the service implements — useful for mocking in tests
export interface ISearchService {
  search(params: SearchParams): Promise<SearchResult[]>;
}

class SearchService implements ISearchService {
  async search(params: SearchParams): Promise<SearchResult[]> {
    try {
      const response = await api.shared.get<ApiEnvelope<RawSearchResult[]>>(
        "/search",
        { params }
      );

      // Normalize _id -> id here, once, so every consumer of
      // SearchResult (SearchComponent, navigation, etc.) can rely on
      // `.id` always being defined.
      return (response.data.data || []).map((raw) => ({
        id: raw._id,
        name: raw.name,
        profileImage: raw.profileImage,
      }));
    } catch (error) {
      console.error("Error while searching:", error);
      throw error;
    }
  }
}

// Export a singleton instance for use across the app
export const searchService = new SearchService();
export default SearchService;
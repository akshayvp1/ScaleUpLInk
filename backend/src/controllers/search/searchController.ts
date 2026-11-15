import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { ISearchController } from "./ISearchController";
import { ISearchService } from "../../services/Search/ISearchService";

// Assumes your `authenticate` middleware attaches the logged-in user's id here.


@injectable()
class SearchController implements ISearchController {
  constructor(
    @inject("SearchService") private searchService: ISearchService
  ) {}

  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.query;
      const currentUserId = req.user!.id; 

      if (!name || typeof name !== "string" || !name.trim()) {
        res.status(400).json({ success: false, message: "Search query is required." });
        return;
      }

      if (!currentUserId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const users = await this.searchService.searchUsers(name.trim(), currentUserId);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("Error while searching users:", error);
      res.status(500).json({ success: false, message: "Failed to search users." });
    }
  };
}

export default SearchController;
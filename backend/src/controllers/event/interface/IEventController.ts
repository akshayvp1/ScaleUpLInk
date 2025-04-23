import { Request,Response,NextFunction } from "express"
export default interface IEventController {
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEventById(req: Request, res: Response, next: NextFunction): Promise<void>;
  }
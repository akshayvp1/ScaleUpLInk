import { Request,Response } from "express"
export default interface IEventController{
    createEvent(req: Request, res: Response): Promise<void>
    getAllEvents(req: Request, res: Response): Promise<void>
    getEventsById(req: Request, res: Response): Promise<void>
}
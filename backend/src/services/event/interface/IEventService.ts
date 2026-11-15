import { ICreateEventDTO,EventDocument,RawEventProps } from "../../../interfaces/IEvent"
export default interface IEventService{
    createEvent(currentUserId: string, data: ICreateEventDTO): Promise<EventDocument> 
    getAllEvents(): Promise<RawEventProps[]>
    getEventsById(eventId: string): Promise<RawEventProps | null>
}
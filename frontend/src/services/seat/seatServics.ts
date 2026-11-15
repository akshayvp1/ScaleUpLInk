import { api } from "../../utils/axiosInterceptor";

export interface Seat {
  _id?: string;
  eventId: string;
  seatLabel: string;
  row: string;
  number: number;
  category: string;
  price: number;
  status: 'available' | 'held' | 'booked';
  heldBy?: string | null;
  holdExpiresAt?: string | null;
  bookingId?: string | null;
}

interface HoldSeatsResponse {
  seats: Seat[];
}

interface GenerateSeatsResponse {
  success: boolean;
  seats: Seat[];
}

interface SeatRowInput {
  row: string;
  count: number;
  category: string;
  price: number;
}

interface ISeatService {
  getSeatsForEvent(eventId: string): Promise<Seat[]>;
  generateSeatsForEvent(eventId: string, rows: SeatRowInput[]): Promise<Seat[]>;
  holdSeats(eventId: string, seatLabels: string[]): Promise<Seat[]>;
  releaseSeats(eventId: string, seatLabels: string[]): Promise<void>;
}

class SeatService implements ISeatService {
  async getSeatsForEvent(eventId: string): Promise<Seat[]> {
    try {
      const response = await api.seats.get(`/${eventId}`);
      return response.data.seats || response.data || [];
    } catch (error) {
      console.error(`Error fetching seats for event ${eventId}:`, error);
      throw error;
    }
  }

  async generateSeatsForEvent(eventId: string, rows: SeatRowInput[]): Promise<Seat[]> {
    try {
      const response = await api.seats.post<GenerateSeatsResponse>('/generate', {
        eventId,
        rows,
      });
      return response.data.seats;
    } catch (error) {
      console.error(`Error generating seats for event ${eventId}:`, error);
      throw error;
    }
  }

  async holdSeats(eventId: string, seatLabels: string[]): Promise<Seat[]> {
    try {
      const response = await api.seats.post<HoldSeatsResponse>('/hold', {
        eventId,
        seatLabels,
      });
      return response.data.seats;
    } catch (error) {
      console.error('Error holding seats:', error);
      throw error;
    }
  }

  async releaseSeats(eventId: string, seatLabels: string[]): Promise<void> {
    try {
      await api.seats.post('/release', { eventId, seatLabels });
    } catch (error) {
      console.error('Error releasing seats:', error);
      throw error;
    }
  }
}

export default new SeatService();
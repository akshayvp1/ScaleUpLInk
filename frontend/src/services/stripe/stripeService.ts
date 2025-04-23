// src/services/stripe/stripeService.ts
import { api } from "../../utils/axiosInterceptor";

interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

interface StripeCheckoutData {
  userId: string;
  eventId: string;
  tickets: Ticket[];
}

interface IStripeService {
  createCheckoutSession(data: StripeCheckoutData): Promise<{ url: string }>;
}

class StripeService implements IStripeService {
  async createCheckoutSession(data: StripeCheckoutData): Promise<{ url: string }> {
    try {
      // Make sure tickets have the right structure with all required fields
      const formattedTickets = data.tickets.map(ticket => ({
        type: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity,
        totalPrice: ticket.price * ticket.quantity
      }));

      const response = await api.stripe.post('/create-checkout-session', {
        ...data,
        tickets: formattedTickets
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating Stripe checkout session:', error);
      
      // Provide a more useful error message
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`Payment error: ${error.response.data.error}`);
      } else {
        throw new Error('Unable to process payment. Please try again later.');
      }
    }
  }
}

export default new StripeService();
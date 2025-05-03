import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IPaymentController } from "./interface/IPaymentController";
import PaymentService from "../../services/payment/paymentService";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-11-15",
  });

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

@injectable()
class PaymentController implements IPaymentController {
    constructor(
        @inject("PaymentService") private paymentService: PaymentService
    ) {}

    createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
        
        try {
            const { eventId, amount, isRetry, paymentIntentId } = req.body;
            console.log(req.body,"fdsmlfdkslfdslkfdslkfdls;kk;ll🤷‍♂️🤷‍♂️;")
            console.log(eventId,"hhhhhhhhh💕💕💕")
            const userId = req.user?.id;
            console.log(eventId,paymentIntentId,"❤️")
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const paymentIntent = await this.paymentService.createPaymentIntent(
                eventId,
                userId,
                amount,
                isRetry,
                paymentIntentId
            );
            console.log(paymentIntent,"🤣🤣🤣🤣")

            res.status(200).json({
                success: true,
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error: any) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message || 'Something went wrong',
            });
        }
    };

    handleWebhook = async (req: Request, res: Response): Promise<void> => {
        const sig = req.headers["stripe-signature"] as string;

        try {
            if (!sig) {
                throw new Error("No Stripe signature found");
            }

            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                stripeWebhookSecret
            );

            await this.paymentService.handleWebhookEvent(event);
            res.status(200).json({ received: true });
        } catch (error: any) {
            console.error("Stripe Webhook Error:", error.message);
            res.status(400).json({
                success: false,
                message: error.message || "Webhook error",
            });
        }
    };
    verifyPayment = async(req:Request,res:Response):Promise<void>=>{
        try{
          const {paymentIntentId}=req.params;
          console.log(paymentIntentId,"dddd")
          const payment = await this.paymentService.verifyPayment(paymentIntentId as string)

          if(!payment){
            res.status(400).json({
                success:false,
                message:'payment not found'
            })
          }
          res.status(200).json({success:true,payment})
        }catch(error){
            console.log(error)
        }
    }
    // findPayment = async(req:Request,res:Response):Promise<void>=>{
    //     try{
    //       const userId = req.user?.id
    //       if(!userId){
    //         res.status(401).json({
    //             success:false,
    //             message:"user not authenticated"
    //         })
    //         return 
    //       }
    //       const response = await this.paymentService.findPayments(userId)
    //       if(!response){
    //         res.status(404).json({
    //             success:false,
    //             message:"Not found any data"
    //         })
    //       }
    //       res.status(200).json({
    //         success:true,
    //         message:'Payment list generated successfully',
    //         payments:response
    //       })
    //     }catch(error){
    //         console.log(error)
    //     }
    // }
}

export default PaymentController;


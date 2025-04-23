import { injectable } from "tsyringe";
import { IStripeController } from "./interface/IStripeController";
// import StripeService from "../../services/stripe/stripeService";



@injectable()
class StripeController implements IStripeController{
    // constructor(
    //     @inject("StripeService") private stripeService:StripeService
    // ){}

    
}


export default StripeController
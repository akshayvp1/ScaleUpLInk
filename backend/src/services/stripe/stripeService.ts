import {injectable } from "tsyringe";
import { IStripeController } from "../../controllers/stripe/interface/IStripeController";
// import StripeRepository from "../../repositories/stripe/stripeRepository";


@injectable()
class StripeService implements IStripeController{
  constructor(
    // @inject("StripeRepository")private stripeRepository:StripeRepository
  ){}
}


export default StripeService
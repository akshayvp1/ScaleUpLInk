import { injectable } from "tsyringe";
import { IStripeRepository } from "./interface/IStripeRepository";



@injectable()
class StripeRepository implements IStripeRepository{

}


export default StripeRepository
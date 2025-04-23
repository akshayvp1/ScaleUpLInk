import { inject, injectable } from "tsyringe";
import { IAdminAuthRepository } from "./interface/IAdminAuthRepository";
import { IAdmin } from "../../interfaces/IAdmin";
import { Model } from "mongoose";

@injectable()
class AdminAuthRepository implements IAdminAuthRepository {
  private readonly model: Model<IAdmin>;

  constructor(@inject("AdminModel") model: Model<IAdmin>) {
    this.model = model;
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
       
      return await this.model.findOne({email:email})
      
      
    } catch (error) {
      console.error("Error finding admin by email:", error);
      return null;
    }
  }
}

export default AdminAuthRepository;

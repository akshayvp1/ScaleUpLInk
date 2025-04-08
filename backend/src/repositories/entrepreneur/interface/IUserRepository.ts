import { IUser } from "../../../interfaces/IUser";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findUserById(id: string): Promise<IUser | null>;
    findUserByEmail(email: string): Promise<IUser | null>
    addInterests(
        email: string, 
        interests: string[], 
        profession?: string
      ): Promise<IUser | null> 


       updateData(
          data: {
            name?: string,
            contactNumber?: string,
            profileImage?: string,
            bio?: string,
            email: string
          }
        ): Promise<IUser | null>
}

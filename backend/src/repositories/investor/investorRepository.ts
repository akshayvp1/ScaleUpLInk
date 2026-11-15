import { injectable, inject } from "tsyringe";
import { IUser } from "../../interfaces/IUser";
import {
    IInvestorRepository,
    InvestorListOptions,
    InvestorListResult,
} from "../investor/interface/IInvestorRepository";
import { FilterQuery, Model } from "mongoose";

const escapeRegex = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


@injectable()
class InvestorRepository implements IInvestorRepository {

    private readonly model: Model<IUser>;


    constructor(
        @inject("UserModel") model: Model<IUser>
    ) {
        this.model = model;
    }



    async createUser(
        userData: Partial<IUser>
    ): Promise<IUser> {

        try {


            const newUser = new this.model({

                ...userData,


                isBlocked: false,

                isPremium: userData.isPremium || false,

                plan: userData.plan || "free",


                createdAt: new Date(),

                updatedAt: new Date(),


                followers: [],

                following: [],

                interests: [],

                savedPost: [],


                isActive:true,



                investorDetails:

                    userData.role === "investor" &&
                    userData.investorDetails

                    ?

                    {

                        companyName:
                        userData.investorDetails.companyName || "",


                        companyFounded:
                        userData.investorDetails.companyFounded
                        ?
                        Number(
                            userData.investorDetails.companyFounded
                        )
                        :
                        undefined,



                        companyRegistration:
                        userData.investorDetails.companyRegistration
                        ?
                        Number(
                            userData.investorDetails.companyRegistration
                        )
                        :
                        undefined,


                    }

                    :

                    undefined

            });



            await newUser.save();



            return newUser.toObject() as IUser;



        } catch(error){


            throw new Error(
                "Error creating user: " + error
            );


        }

    }






    async listInvestors(
        options: InvestorListOptions
    ): Promise<InvestorListResult> {

        const { search, sort = "newest" } = options;

        const page = Math.max(1, options.page);
        const limit = Math.min(50, Math.max(1, options.limit));

        const filters: FilterQuery<IUser> = {
            role: "investor",
            isActive: true,
        };

        if (options.excludeId) {
            filters._id = { $ne: options.excludeId };
        }

        const trimmed = search?.trim();

        if (trimmed) {
            const regex = new RegExp(escapeRegex(trimmed), "i");

            filters.$or = [
                { name: regex },
                { profession: regex },
                { bio: regex },
                { "investorDetails.companyName": regex },
            ];
        }

        const sortMap: Record<string, 1 | -1> =
            sort === "name"
                ? { name: 1 }
                : sort === "company"
                ? { "investorDetails.companyName": 1, name: 1 }
                : { createdAt: -1 };

        const [investors, total] = await Promise.all([
            this.model
                .find(filters)
                .select(
                    "_id name profileImage coverImage bio profession role investorDetails interests age createdAt"
                )
                .sort(sortMap)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean<IUser[]>(),

            this.model.countDocuments(filters),
        ]);

        return { investors, total };
    }

    async findInvestorById(
        id:string
    ):Promise<IUser | null>{


        try{


            const investor =
            await this.model
            .findById(id)
            .select("-password");



            return investor as IUser | null;



        }catch(error){


            throw new Error(
                "Error finding investor by ID: " + error
            );


        }


    }


}


export default InvestorRepository;
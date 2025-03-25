// import { api } from "../../utils/axiosInterceptor";

// export interface RegisterCredentials {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   companyName?: string;
//   companyFounded?: string;
//   businessRegNumber?: string;
//   contactNumber?: string;
//   investmentHistory?: File | null;
//   role: "entrepreneur" | "investor";
// }

// export const registerUser = async (credentials: RegisterCredentials, role: "admin" | "entrepreneur" | "investor") => {
//   try {
    
//     console.log(credentials, "cred")

//     const response = await api[role].post("/send-otp", credentials);
//     return response.data;
//   } catch (error) {
//     console.error("Registration Error:", error);
//     throw error;
//   }
// };

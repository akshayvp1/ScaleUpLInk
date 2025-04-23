// import { api } from "../../utils/axiosInterceptor";

// interface StatusResponse {
//   success: boolean;
//   message?: string;
// }

// class SharedService {
//     async checkStatus() {
//         try {
//             const response = await api.shared.get("/auth/status");
//             return response.data; 
//         } catch (error) {
//             return { success: false }; 
//         }
//     }
    
// }

// const sharedService = new SharedService();
// export default sharedService;




import { api } from "../../utils/axiosInterceptor";

interface StatusResponse {
  success: boolean;
  message?: string;
}

class SharedService {
  async checkStatus(): Promise<StatusResponse> {
    try {
      const response = await api.shared.get("/auth/status");
      console.log(response.data.message,"edooooooo")
      return response.data;
    } catch (error) {
      console.error("Error checking status:", error);
      return { success: false, message: "Failed to check status" };
    }
  }
}

const sharedService = new SharedService();
export default sharedService;
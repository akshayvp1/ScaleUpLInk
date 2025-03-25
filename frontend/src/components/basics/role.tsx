import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/app/store";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { UserRole } from "../../types/auth/auth.types";
import { store } from "../../redux/app/store";
import { toast } from "react-hot-toast";
import authService from "../../services/user/authService";


type Role = "entrepreneur" | "investor" | "admin";

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);

  interface EntrepreneurRegistrationForm {
    name:string,
    email:string,
    role:string,
  }
  console.log("Temp User Email:", tempUser?.email);
  
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    console.log("Role selected:", role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
  
    setIsLoading(true);
  
    try {
      const currentTempUser = store.getState().tempUser.tempUser;

      console.log("bbbbbb",currentTempUser?.token)
  
      dispatch(
        setTempUser({
          tempUser: {
            ...currentTempUser,
            role: selectedRole as UserRole,
          },
        })
      );
  
      console.log("Action dispatched. Current selected role:", selectedRole);
  
      toast.success("Your profession has been selected successfully!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
        },
      });
  
      if (selectedRole === "investor") {
        navigate("/investor-register");
      } else if (selectedRole === "entrepreneur") {
        const userData = {
          name: tempUser?.name,
          email: tempUser?.email,
          role: selectedRole as UserRole
        };
  
        try {
          await authService.entrepeneruRole(userData);
          navigate('/profession')
        } catch (error) {
          console.error("Error updating role:", error);
          toast.error("Failed to assign role. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error handling role selection:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const userr = useSelector((state: RootState) => state.tempUser.tempUser);
  console.log(userr, "LLLL");

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img src="src/assets/business.jpg" alt="Role Selection" className="max-w-xs" />
        </div>
        <Card className="w-full p-6 border rounded-none">
          <CardContent className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Choose Your Role</h2>
            <p className="text-center text-gray-600">
              Select how you want to use our platform
            </p>
            
            <div className="space-y-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => handleRoleSelect("entrepreneur")}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === "entrepreneur" 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border mr-3 ${
                    selectedRole === "entrepreneur" 
                      ? "border-orange-500 bg-orange-500" 
                      : "border-gray-300"
                  }`}>
                    {selectedRole === "entrepreneur" && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Entrepreneur</h3>
                    <p className="text-sm text-gray-500">
                      I want to showcase my business and find investors
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => handleRoleSelect("investor")}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === "investor" 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border mr-3 ${
                    selectedRole === "investor" 
                      ? "border-orange-500 bg-orange-500" 
                      : "border-gray-300"
                  }`}>
                    {selectedRole === "investor" && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">Investor</h3>
                    <p className="text-sm text-gray-500">
                      I want to discover and invest in promising businesses
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full mt-6 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                "Continue"
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-500 pt-2">
              ScaleUp Link{" "}
              
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
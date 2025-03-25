import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import authService from "../../services/user/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/app/store";

interface InvestorRegistrationForm {
  name:string,
  email:string,
  companyName: string;
  companyFounded: string;
  businessRegNumber: string;
  contactNumber: string;
}

export default function InvestorRegistrationPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const tempUser = useSelector((state:RootState)=>state.tempUser.tempUser)
  const { 
    register, 
    handleSubmit, 
    formState: { errors }
  } = useForm<InvestorRegistrationForm>({
    mode: "onChange"
  });

  
  const onSubmit = async (data: InvestorRegistrationForm) => {
    const userData = {
      name:tempUser?.name,
      email:tempUser?.email,
      role:tempUser?.role,
      companyName:data.companyName,
      companyFounded: data.companyFounded,
      businessRegNumber: data.businessRegNumber,
      contactNumber: data.contactNumber,

    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      setErrorMessage("");
      setSuccessMessage("");


      await authService.completeProfile(userData)
      
      // Simulate successful submission
      setTimeout(() => {
        setSuccessMessage("Registration Successful 🎉");
        navigate("/profession"); // Redirect to appropriate page
      }, 1500);
      
    } catch (error) {
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-start justify-center pt-20 bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img src="src/assets/business.jpg" alt="Investor Registration" className="max-w-xs" />
        </div>
        <Card className="w-full p-6 border rounded-none">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold text-center">Investor Registration</h2>
            {errorMessage && (
              <div className="p-2 bg-red-100 text-red-600 text-center rounded-md">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="p-2 bg-green-100 text-green-600 text-center rounded-md">{successMessage}</div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input 
                  type="text" 
                  placeholder="Company Name" 
                  {...register("companyName", {
                    required: "Company name is required",
                    minLength: {
                      value: 5,
                      message: "Company name must be at least 5 characters"
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9\s]+$/,
                      message: "Company name must contain only letters, numbers and spaces"
                    }
                  })}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
                )}
              </div>
              
              <div>
                <Input 
                  type="text" 
                  placeholder="Year Founded" 
                  {...register("companyFounded", {
                    required: "Founding year is required",
                    pattern: {
                      value: /^(19[0-9][0-9]|20[0-1][0-9]|202[0-5])$/,
                      message: "Year must be between 1900-2025 with 4 digits"
                    }
                  })}
                />
                {errors.companyFounded && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyFounded.message}</p>
                )}
              </div>
              
              <div>
                <Input 
                  type="text" 
                  placeholder="Business Registration Number" 
                  {...register("businessRegNumber", {
                    required: "Business registration number is required",
                    minLength: {
                      value: 5,
                      message: "Registration number must be at least 5 characters"
                    },
                    maxLength: {
                      value: 15,
                      message: "Registration number must be at most 15 characters"
                    },
                    pattern: {
                      value: /^\S+$/,
                      message: "Registration number cannot contain spaces"
                    }
                  })}
                />
                {errors.businessRegNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.businessRegNumber.message}</p>
                )}
              </div>
              
              <div>
                <Input 
                  type="text" 
                  placeholder="Contact Number" 
                  {...register("contactNumber", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^[0-9]{10,15}$/,
                      message: "Please enter a valid contact number (10-15 digits)"
                    }
                  })}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
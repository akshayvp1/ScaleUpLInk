import { Card } from "../../components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/app/store";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { store } from "../../redux/app/store";
import { toast } from "react-hot-toast"; // Import react-hot-toast
import {
  FaUserTie, FaHandshake, FaLaptopCode, FaUserFriends,
  FaPencilRuler, FaHeartbeat, FaChair, FaChartLine,
  FaBalanceScale, FaShoppingCart, FaNewspaper, FaBuilding,
  FaNetworkWired, FaCog
} from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

interface ProfessionOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function ProfessionSelectionPage() {
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const dispatch = useDispatch();
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
  const navigate = useNavigate();

  const professions: ProfessionOption[] = [
    { id: "executive", label: "Executive & Leadership", icon: <FaUserTie size={20} /> },
    { id: "business", label: "Business", icon: <FaHandshake size={20} /> },
    { id: "technology", label: "Technology & IT", icon: <FaLaptopCode size={20} /> },
    { id: "hr", label: "Human Resources", icon: <FaUserFriends size={20} /> },
    { id: "creative", label: "Creative & Design", icon: <FaPencilRuler size={20} /> },
    { id: "healthcare", label: "Healthcare & Medical", icon: <FaHeartbeat size={20} /> },
    { id: "managing", label: "Managing Director", icon: <FaChair size={20} /> },
    { id: "account", label: "Account Management", icon: <FaChartLine size={20} /> },
    { id: "engineering", label: "Engineering", icon: <FaCog size={20} /> },
    { id: "legal", label: "Legal & Compliance", icon: <FaBalanceScale size={20} /> },
    { id: "sales", label: "Sales & Customer Service", icon: <FaShoppingCart size={20} /> },
    { id: "marketing", label: "Marketing", icon: <FaNetworkWired size={20} /> },
    { id: "media", label: "Media & Entertainment", icon: <FaNewspaper size={20} /> },
    { id: "construction", label: "Construction & Real Estate", icon: <FaBuilding size={20} /> },
    { id: "others", label: "Others", icon: <BsThreeDots size={20} /> },
  ];

  const handleSelect = (id: string) => {
    setSelectedProfession(id);
    dispatch(
      setTempUser({
        tempUser: {
          ...tempUser,
          profession: id,
        },
      })
    );
  };

  const handleContinue = () => {
    const user = store.getState().tempUser;

    if (user) {
      toast.success("Your profession has been selected successfully!", {
        position: "top-right",
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
        },
      });
      navigate("/choose-interest");
    }
  };

  return (
    <div className="flex h-screen items-start justify-center pt-10 bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Left Side - Illustration */}
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img
            src="src//assets/business.jpg" // Place the image in the public folder
            alt="Professional Collaboration"
            className="max-w-xs"
          />
        </div>

        {/* Right Side - Profession Selection */}
        <div className="w-full p-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Select Your Profession</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {professions.map((profession) => (
              <motion.div key={profession.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className={`w-full h-auto py-3 px-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 ${
                    selectedProfession === profession.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelect(profession.id)}
                >
                  <div className="text-gray-600">{profession.icon}</div>
                  <span className="text-xs text-center">{profession.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              className="px-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              disabled={!selectedProfession}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

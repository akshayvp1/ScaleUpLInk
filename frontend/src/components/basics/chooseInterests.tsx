import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine, FaUsers, FaGlobe, FaLaptopCode, FaCog,
  FaCalculator, FaBookOpen, FaBriefcase, FaFileContract, FaBullhorn,
  FaChartPie, FaBuilding, FaHeadset, FaClipboardList, FaLightbulb
} from "react-icons/fa";
import authService from "../../services/user/authService";
import { store } from '../../redux/app/store';
import buinessIMg from "../../assets/business.jpg";

interface ProfessionalInterestOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function ProfessionalInterestsSelectionPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const professionalInterests: ProfessionalInterestOption[] = [
    { id: "data_analytics", label: "Data Analytics", icon: <FaChartLine size={20} /> },
    { id: "leadership", label: "Leadership", icon: <FaUsers size={20} /> },
    { id: "global_business", label: "Global Business", icon: <FaGlobe size={20} /> },
    { id: "software_dev", label: "Software Development", icon: <FaLaptopCode size={20} /> },
    { id: "operations", label: "Operations", icon: <FaCog size={20} /> },
    { id: "finance", label: "Finance", icon: <FaCalculator size={20} /> },
    { id: "research", label: "Research", icon: <FaBookOpen size={20} /> },
    { id: "consulting", label: "Consulting", icon: <FaBriefcase size={20} /> },
    { id: "legal", label: "Legal", icon: <FaFileContract size={20} /> },
    { id: "marketing", label: "Marketing", icon: <FaBullhorn size={20} /> },
    { id: "strategy", label: "Business Strategy", icon: <FaChartPie size={20} /> },
    { id: "corporate", label: "Corporate Affairs", icon: <FaBuilding size={20} /> },
    { id: "client_relations", label: "Client Relations", icon: <FaHeadset size={20} /> },
    { id: "project_mgmt", label: "Project Management", icon: <FaClipboardList size={20} /> },
    { id: "innovation", label: "Innovation", icon: <FaLightbulb size={20} /> },
  ];

  const handleSelect = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      }
      return [...prev, interestId];
    });
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one professional interest");
      return;
    }

    const currentTempUser = store.getState().tempUser.tempUser;
    
    if (!currentTempUser?.email) {
      toast.error("User email not found. Please log in again.");
      return;
    }

    const data = {
      email: currentTempUser.email,
      profession: currentTempUser.profession,
      interest: selectedInterests 
    };

    try {
      setLoading(true);
      await authService.addInterests(data);
      toast.success("Professional interests saved successfully!");
      navigate("/mainpage/dashboard"); // Adjust the navigation path as needed
    } catch (error) {
      console.error("Error saving interests:", error);
      toast.error("Failed to save professional interests");
    } finally {
      setLoading(false);
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
            src={buinessIMg}
            alt="Professional Collaboration"
            className="max-w-xs"
          />
        </div>

        {/* Right Side - Professional Interests Selection */}
        <div className="w-full p-6">
          <h2 className="text-3xl font-bold mb-2 text-center">Professional Interests</h2>
          <p className="text-center text-gray-500 mb-6">Select all that apply to your career focus</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {professionalInterests.map((interest) => (
              <motion.div key={interest.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className={`w-full h-auto py-3 px-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 ${
                    selectedInterests.includes(interest.id)
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelect(interest.id)}
                >
                  <div className="text-gray-600">{interest.icon}</div>
                  <span className="text-xs text-center">{interest.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              className="px-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              disabled={selectedInterests.length === 0 || loading}
              onClick={handleContinue}
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}












// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Button } from "../../components/ui/button";
// import { toast } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import {
//   FaChartLine, FaUsers, FaGlobe, FaLaptopCode, FaCog,
//   FaCalculator, FaBookOpen, FaBriefcase, FaFileContract, FaBullhorn,
//   FaChartPie, FaBuilding, FaHeadset, FaClipboardList, FaLightbulb
// } from "react-icons/fa";
// import authService from "../../services/user/authService";
// import { store } from '../../redux/app/store';
// import buinessIMg from "../../assets/business.jpg";
// import Dark from "../../assets/dark.jpg";
// import { useTheme } from "../theme-provider";

// interface ProfessionalInterestOption {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// export default function ProfessionalInterestsSelectionPage() {
//   const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   const { theme } = useTheme();

//   const professionalInterests: ProfessionalInterestOption[] = [
//     { id: "data_analytics", label: "Data Analytics", icon: <FaChartLine size={20} /> },
//     { id: "leadership", label: "Leadership", icon: <FaUsers size={20} /> },
//     { id: "global_business", label: "Global Business", icon: <FaGlobe size={20} /> },
//     { id: "software_dev", label: "Software Development", icon: <FaLaptopCode size={20} /> },
//     { id: "operations", label: "Operations", icon: <FaCog size={20} /> },
//     { id: "finance", label: "Finance", icon: <FaCalculator size={20} /> },
//     { id: "research", label: "Research", icon: <FaBookOpen size={20} /> },
//     { id: "consulting", label: "Consulting", icon: <FaBriefcase size={20} /> },
//     { id: "legal", label: "Legal", icon: <FaFileContract size={20} /> },
//     { id: "marketing", label: "Marketing", icon: <FaBullhorn size={20} /> },
//     { id: "strategy", label: "Business Strategy", icon: <FaChartPie size={20} /> },
//     { id: "corporate", label: "Corporate Affairs", icon: <FaBuilding size={20} /> },
//     { id: "client_relations", label: "Client Relations", icon: <FaHeadset size={20} /> },
//     { id: "project_mgmt", label: "Project Management", icon: <FaClipboardList size={20} /> },
//     { id: "innovation", label: "Innovation", icon: <FaLightbulb size={20} /> },
//   ];

//   const handleSelect = (interestId: string) => {
//     setSelectedInterests(prev => {
//       if (prev.includes(interestId)) {
//         return prev.filter(id => id !== interestId);
//       }
//       return [...prev, interestId];
//     });
//   };

//   const handleContinue = async () => {
//     if (selectedInterests.length === 0) {
//       toast.error("Please select at least one professional interest", {
//         position: "top-right",
//         duration: 3000,
//         style: {
//           background: theme === "dark" ? "#444" : "#333",
//           color: "#fff",
//           borderRadius: "8px",
//         },
//       });
//       return;
//     }

//     const currentTempUser = store.getState().tempUser.tempUser;
    
//     if (!currentTempUser?.email) {
//       toast.error("User email not found. Please log in again.", {
//         position: "top-right",
//         duration: 3000,
//         style: {
//           background: theme === "dark" ? "#444" : "#333",
//           color: "#fff",
//           borderRadius: "8px",
//         },
//       });
//       return;
//     }

//     const data = {
//       email: currentTempUser.email,
//       profession: currentTempUser.profession,
//       interest: selectedInterests 
//     };

//     try {
//       setLoading(true);
//       await authService.addInterests(data);
//       toast.success("Professional interests saved successfully!", {
//         position: "top-right",
//         duration: 3000,
//         style: {
//           background: theme === "dark" ? "#444" : "#333",
//           color: "#fff",
//           borderRadius: "8px",
//         },
//       });
//       navigate("/mainpage/dashboard");
//     } catch (error) {
//       console.error("Error saving interests:", error);
//       toast.error("Failed to save professional interests", {
//         position: "top-right",
//         duration: 3000,
//         style: {
//           background: theme === "dark" ? "#444" : "#333",
//           color: "#fff",
//           borderRadius: "8px",
//         },
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
//       >
//         {/* Left Side - Professional Interests Selection */}
//         <div className="w-full p-8">
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
//                 Professional Interests
//               </h2>
//               <p className="mt-2 text-gray-500 dark:text-gray-400">
//                 Select all that apply to your career focus
//               </p>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//               {professionalInterests.map((interest) => (
//                 <motion.div key={interest.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
//                   <Button
//                     variant="outline"
//                     className={`w-full h-auto py-3 px-3 flex flex-col items-center justify-center gap-2 rounded-lg border-2 ${
//                       selectedInterests.includes(interest.id)
//                         ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/20"
//                         : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
//                     } text-gray-700 dark:text-gray-200`}
//                     onClick={() => handleSelect(interest.id)}
//                   >
//                     <div className="text-gray-600 dark:text-gray-300">{interest.icon}</div>
//                     <span className="text-xs text-center">{interest.label}</span>
//                   </Button>
//                 </motion.div>
//               ))}
//             </div>

//             <div className="flex justify-center">
//               <Button
//                 className="w-full max-w-xs bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg py-2"
//                 disabled={selectedInterests.length === 0 || loading}
//                 onClick={handleContinue}
//               >
//                 {loading ? "Saving..." : "Continue"}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Image */}
//         <motion.div
//           initial={{ opacity: 0, x: 20, rotate: 5 }}
//           animate={{ opacity: 1, x: 0, rotate: 5 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="hidden md:flex items-center justify-center p-8 bg-white dark:bg-gray-800"
//         >
//           <img
//             src={theme === "dark" ? Dark : buinessIMg}
//             alt="Professional Collaboration"
//             className="max-w-full h-auto rounded-lg shadow-md"
//           />
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }
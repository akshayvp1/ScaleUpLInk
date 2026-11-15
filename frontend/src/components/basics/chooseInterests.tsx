import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  FaChartLine,
  FaUsers,
  FaGlobe,
  FaLaptopCode,
  FaCog,
  FaCalculator,
  FaBookOpen,
  FaBriefcase,
  FaFileContract,
  FaBullhorn,
  FaChartPie,
  FaBuilding,
  FaHeadset,
  FaClipboardList,
  FaLightbulb,
} from "react-icons/fa";

import { Button } from "../ui/button";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import authService from "../../services/user/authService";
import { store } from "../../redux/app/store";
import { cn } from "../../lib/utils";

interface ProfessionalInterestOption {
  id: string;
  label: string;
  icon: ReactNode;
}

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

export default function ProfessionalInterestsSelectionPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelect = (interestId: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
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
      interest: selectedInterests,
    };

    try {
      setLoading(true);
      await authService.addInterests(data);
      toast.success("Professional interests saved successfully!");
      navigate("/mainpage/dashboard");
    } catch (error) {
      console.error("Error saving interests:", error);
      toast.error("Failed to save professional interests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout contentClassName="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <AuthHeader
          title="What are you interested in?"
          description="Select all that apply to your career focus. This helps us personalize your experience."
        />

        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          role="group"
          aria-label="Professional interests"
        >
          {professionalInterests.map((interest) => {
            const selected = selectedInterests.includes(interest.id);

            return (
              <motion.button
                key={interest.id}
                type="button"
                aria-pressed={selected}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(interest.id)}
                className={cn(
                  "focus-visible:ring-ring/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-colors outline-none focus-visible:ring-[3px]",
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {selected && (
                  <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full">
                    <Check className="size-3" />
                  </span>
                )}
                <span className="text-foreground">{interest.icon}</span>
                <span className="text-xs font-medium">{interest.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {selectedInterests.length} selected
          </p>
          <Button
            size="lg"
            className="w-full sm:w-auto sm:px-10"
            disabled={selectedInterests.length === 0}
            loading={loading}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

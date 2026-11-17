import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  FaChartLine,
  FaHandshake,
  FaBullhorn,
  FaRocket,
  FaChartPie,
  FaUsers,
  FaLightbulb,
  FaCog,
  FaSearch,
  FaBuilding,
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
  {
    id: "startup_investments",
    label: "Startup Investments",
    icon: <FaChartLine size={20} />,
  },
  {
    id: "funding_fundraising",
    label: "Funding and Fundraising",
    icon: <FaHandshake size={20} />,
  },
  {
    id: "business_networking",
    label: "Business Networking",
    icon: <FaUsers size={20} />,
  },
  {
    id: "startup_growth",
    label: "Startup Growth",
    icon: <FaRocket size={20} />,
  },
  {
    id: "venture_capital",
    label: "Venture Capital",
    icon: <FaChartPie size={20} />,
  },
  { id: "mentorship", label: "Mentorship", icon: <FaLightbulb size={20} /> },
  {
    id: "technology_innovation",
    label: "Technology and Innovation",
    icon: <FaCog size={20} />,
  },
  {
    id: "business_strategy",
    label: "Business Strategy",
    icon: <FaBullhorn size={20} />,
  },
  {
    id: "market_research",
    label: "Market Research",
    icon: <FaSearch size={20} />,
  },
  {
    id: "business_partnerships",
    label: "Business Partnerships",
    icon: <FaBuilding size={20} />,
  },
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
      toast.error("Please select at least one interest");
      return;
    }

    const currentTempUser = store.getState().tempUser.tempUser;

    if (!currentTempUser?.email) {
      toast.error("User email not found. Please log in again.");
      return;
    }

    const selectedLabels = professionalInterests
      .filter((interest) => selectedInterests.includes(interest.id))
      .map((interest) => interest.label);

    if (!currentTempUser.profession) {
      toast.error("Please select your profession first.");
      return;
    }

    const data = {
      email: currentTempUser.email,
      profession: currentTempUser.profession,
      interest: selectedLabels,
    };

    try {
      setLoading(true);
      await authService.addInterests(data);
      toast.success("Interests saved successfully!");
      navigate("/mainpage/dashboard");
    } catch (error) {
      console.error("Error saving interests:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save interests"
      );
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
          description="Select all that apply. This helps us personalize your experience."
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

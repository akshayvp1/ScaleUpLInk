import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  FaUserTie,
  FaHandshake,
  FaLaptopCode,
  FaUserFriends,
  FaPencilRuler,
  FaHeartbeat,
  FaChair,
  FaChartLine,
  FaBalanceScale,
  FaShoppingCart,
  FaNewspaper,
  FaBuilding,
  FaNetworkWired,
  FaCog,
} from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

import { Button } from "../ui/button";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { RootState, store } from "../../redux/app/store";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { cn } from "../../lib/utils";

interface ProfessionOption {
  id: string;
  label: string;
  icon: ReactNode;
}

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

export default function ProfessionSelectionPage() {
  const [selectedProfession, setSelectedProfession] = useState<string | null>(
    null
  );
  const dispatch = useDispatch();
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
  const navigate = useNavigate();

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
          background: "var(--card)",
          color: "var(--card-foreground)",
          borderRadius: "8px",
        },
      });
      navigate("/choose-interest");
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
          title="Select your profession"
          description="Choose the option that best describes your role."
        />

        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Profession"
        >
          {professions.map((profession) => {
            const selected = selectedProfession === profession.id;

            return (
              <motion.button
                key={profession.id}
                type="button"
                role="radio"
                aria-checked={selected}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(profession.id)}
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
                <span className="text-foreground">{profession.icon}</span>
                <span className="text-xs font-medium">{profession.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto sm:px-10"
            disabled={!selectedProfession}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

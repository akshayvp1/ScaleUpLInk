import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  FaHandshake,
  FaUserTie,
  FaChartLine,
  FaBuilding,
  FaChair,
  FaUserFriends,
  FaBriefcase,
  FaCog,
} from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { RootState } from "../../redux/app/store";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { cn } from "../../lib/utils";

interface ProfessionOption {
  id: string;
  label: string;
  icon: ReactNode;
}

const professions: ProfessionOption[] = [
  { id: "investor", label: "Investor", icon: <FaHandshake size={20} /> },
  { id: "angel_investor", label: "Angel Investor", icon: <FaUserTie size={20} /> },
  {
    id: "venture_capitalist",
    label: "Venture Capitalist",
    icon: <FaChartLine size={20} />,
  },
  { id: "entrepreneur", label: "Entrepreneur", icon: <FaBuilding size={20} /> },
  {
    id: "startup_founder",
    label: "Startup Founder",
    icon: <FaChair size={20} />,
  },
  { id: "business_owner", label: "Business Owner", icon: <FaUserTie size={20} /> },
  { id: "co_founder", label: "Co-founder", icon: <FaUserFriends size={20} /> },
  {
    id: "business_executive",
    label: "Business Executive",
    icon: <FaBriefcase size={20} />,
  },
  { id: "other", label: "Other", icon: <FaCog size={20} /> },
];

const OTHER_ICON = <BsThreeDots size={20} />;

export default function ProfessionSelectionPage() {
  const [selectedProfession, setSelectedProfession] = useState<string | null>(
    null
  );
  const [customProfession, setCustomProfession] = useState("");
  const dispatch = useDispatch();
  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);
  const navigate = useNavigate();

  const isOther = selectedProfession === "other";
  const canContinue = Boolean(
    selectedProfession && (!isOther || customProfession.trim().length >= 2)
  );

  const handleSelect = (id: string) => {
    setSelectedProfession(id);
    if (id !== "other") setCustomProfession("");
  };

  const handleContinue = () => {
    if (!canContinue) return;

    const selected = professions.find((item) => item.id === selectedProfession);
    const profession = isOther
      ? customProfession.trim()
      : (selected?.label ?? "");

    dispatch(setTempUser({ tempUser: { ...tempUser, profession } }));
    toast.success("Your profession has been selected successfully!", {
      position: "top-right",
      duration: 3000,
    });
    navigate("/choose-interest");
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
                <span className="text-foreground">
                  {profession.id === "other" ? OTHER_ICON : profession.icon}
                </span>
                <span className="text-xs font-medium">{profession.label}</span>
              </motion.button>
            );
          })}
        </div>

        {isOther && (
          <div className="space-y-2">
            <label htmlFor="customProfession" className="text-sm font-medium">
              Tell us your profession
            </label>
            <Input
              id="customProfession"
              value={customProfession}
              onChange={(event) => setCustomProfession(event.target.value)}
              placeholder="e.g. Product Manager"
              maxLength={80}
            />
          </div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto sm:px-10"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Briefcase, Check, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "../ui/button";
import { AuthLayout } from "../auth/AuthLayout";
import { AuthHeader } from "../auth/AuthHeader";
import { RootState, store } from "../../redux/app/store";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { UserRole } from "../../types/auth/auth.types";
import authService from "../../services/user/authService";
import { cn } from "../../lib/utils";

type Role = "entrepreneur" | "investor" | "admin";

const roleOptions = [
  {
    value: "entrepreneur" as const,
    title: "Entrepreneur",
    description: "I want to showcase my business and find investors.",
    icon: Briefcase,
  },
  {
    value: "investor" as const,
    title: "Investor",
    description: "I want to discover and invest in promising businesses.",
    icon: TrendingUp,
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tempUser = useSelector((state: RootState) => state.tempUser.tempUser);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);

    try {
      const currentTempUser = store.getState().tempUser.tempUser;

      dispatch(
        setTempUser({
          tempUser: {
            ...currentTempUser,
            role: selectedRole as UserRole,
          },
        })
      );

      toast.success("Your profession has been selected successfully!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          borderRadius: "8px",
        },
      });

      if (selectedRole === "investor") {
        navigate("/investor/investor-register");
      } else if (selectedRole === "entrepreneur") {
        const userData = {
          name: tempUser?.name,
          email: tempUser?.email,
          role: selectedRole as UserRole,
        };

        try {
          await authService.entrepeneruRole(userData);
          navigate("/profession");
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

  return (
    <AuthLayout contentClassName="max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <AuthHeader
          title="Choose your role"
          description="Select how you want to use ScaleUp Link. You can update this later."
        />

        <div className="space-y-3" role="radiogroup" aria-label="Role">
          {roleOptions.map(({ value, title, description, icon: Icon }) => {
            const selected = selectedRole === value;

            return (
              <motion.button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleRoleSelect(value)}
                className={cn(
                  "focus-visible:ring-ring/50 flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-[3px]",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    {description}
                  </span>
                </span>

                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  )}
                >
                  {selected && <Check className="size-3" />}
                </span>
              </motion.button>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={!selectedRole}
          loading={isLoading}
        >
          Continue
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          You can change your role from your account settings.
        </p>
      </motion.div>
    </AuthLayout>
  );
}

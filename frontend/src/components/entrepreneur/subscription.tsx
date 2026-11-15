import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import BusinessImage from "../../assets/business.jpg";

export default function PricingCard() {
  const plans = [
    {
      title: "Free",
      price: 0,
      period: "Per Month",
      features: [
        "Not allow 100+ connections",
        "Not allow Connection with Investors",
        "Connetion with Enterprenurs",
        "Make a Post",
      ],
      buttonText: "Get Started",
    },
    {
      title: "Paid",
      price: 199,
      period: "Per Month",
      features: [
        "Allow 100+ connections",
        "Connection with Investors",
        "Connetion with Enterprenurs",
        "Make a Post",
      ],
      buttonText: "Get Started",
      highlighted: true,
    },
    {
      title: "Paid",
      price: 999,
      period: "Per Month",
      features: [
        "Allow 100+ connections",
        "Connection with Investors",
        "Connetion with Enterprenurs",
        "Make a Post",
      ],
      buttonText: "Get Started",
    },
  ];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary/[0.06] via-background to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Illustration */}
            <div className="flex items-center justify-center bg-muted/40 p-6">
              <img
                src={BusinessImage}
                alt="Collaboration Illustration"
                className="h-auto max-w-full"
              />
            </div>

            {/* Right Side - Pricing Plans */}
            <div className="bg-card p-6 sm:p-8">
              <h1 className="mb-2 text-center text-2xl font-bold text-foreground [font-family:var(--font-display)]">Select Your Plan</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Connect with professionals, investors &amp; community
              </p>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`w-full rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                      plan.highlighted
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="mb-3 text-center">
                      <h2 className="text-sm font-semibold text-foreground">{plan.title}</h2>
                      <div className="flex items-baseline justify-center">
                        <span className="text-xs text-muted-foreground">₹</span>
                        <span className="text-lg font-bold text-foreground">{plan.price}</span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          /{plan.period.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      size="sm"
                      className="mb-3 w-full rounded-full text-xs"
                    >
                      {plan.buttonText}
                    </Button>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Features
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-xs">
                          <Check className="mr-2 size-3 shrink-0 text-success" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-primary hover:underline">
                  Log In
                </a>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

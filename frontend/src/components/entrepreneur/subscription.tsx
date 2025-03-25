import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Illustration */}
            <div className="bg-white p-6 flex items-center justify-center">
              <img
                src="/src/assets/business.jpg"
                alt="Collaboration Illustration"
                className="max-w-full h-auto"
              />
            </div>

            {/* Right Side - Pricing Plans */}
            <div className="bg-white p-6">
              <h1 className="text-2xl font-bold text-center mb-2">Select Your Plan</h1>
              <p className="text-gray-500 text-center text-sm mb-4">
                Connect with professionals, investors & community
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`p-4 w-full sm:w-30 lg:w-34 rounded-lg border ${
                      plan.highlighted
                        ? "border-orange-500 bg-slate-800 text-white"
                        : "border-gray-200 bg-slate-800 text-white"
                    }`}
                  >
                    <div className="text-center mb-3">
                      <h2 className="text-sm font-semibold">{plan.title}</h2>
                      <div className="flex items-baseline justify-center">
                        <span className="text-xs">₹</span>
                        <span className="text-lg font-bold">{plan.price}</span>
                        <span className="ml-1 text-xs text-gray-400">/{plan.period.toLowerCase()}</span>
                      </div>
                    </div>

                    <Button
                      className={`w-full text-xs ${
                        plan.highlighted
                          ? "bg-orange-500 hover:bg-orange-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } rounded-full h-8 mb-3`}
                    >
                      {plan.buttonText}
                    </Button>

                    <p className="text-xs font-medium mb-2">Features</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-xs">
                          <Check className="h-3 w-3 mr-2 text-blue-400" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="text-center mt-4 text-xs text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
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

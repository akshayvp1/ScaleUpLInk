import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

export default function AgeVerificationPage() {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isOver18, setIsOver18] = useState<boolean | null>(null);

  // Generate arrays of days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  
  // Generate years from current year back to 100 years ago
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 100 },
    (_, i) => String(currentYear - i)
  );

  // Calculate if user is over 18 when date changes
  useEffect(() => {
    if (!day || !month || !year) {
      setIsOver18(null);
      return;
    }

    const birthDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - (parseInt(month) - 1);
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parseInt(day))) {
      age--;
    }
    
    setIsOver18(age >= 18);
  }, [day, month, year]);

  return (
    <div className="flex h-screen items-start justify-center pt-20 bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Left Side - Illustration */}
        <div className="hidden md:flex items-center justify-center bg-white p-8">
          <img
            src="src/assets/business.jpg"
            alt="Entrepreneurs Illustration"
            className="max-w-xs"
          />
        </div>
        
        {/* Right Side - Age Verification Form */}
        <Card className="w-full p-6 border rounded-none">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Select your age here</h2>
            <p className="text-gray-500 text-center">Age must be 18 or above</p>
            
            <div className="pt-2">
              <Label className="text-sm text-gray-500">Date of Birth</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {months.map((m, index) => (
                      <SelectItem key={m} value={m}>
                        {format(new Date(2000, index, 1), "MMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isOver18 === false && (
              <p className="text-red-500 text-sm text-center">
                Sorry, you must be at least 18 years old to continue.
              </p>
            )}
            
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              disabled={!isOver18}
            >
              Continue
            </Button>
            
            <div className="text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service & Privacy Policy
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
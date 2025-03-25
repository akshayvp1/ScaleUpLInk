import React from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Calendar,
  TrendingUp,
  Users,
  Wallet,
  BarChart,
  Globe,
  MessageSquare,
  ArrowRight,
  Zap,
  Award,
  Search
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="flex flex-col items-center text-center pt-6">
        <div className="rounded-full bg-blue-100 p-3 mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
};

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, role }) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <p className="text-slate-700 italic mb-4">"{quote}"</p>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-500 mr-3 flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-slate-600">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-slate-800 text-white">
        <div className="absolute inset-0 z-0 opacity-10">
          {/* <img 
            src="/api/placeholder/1200/600" 
            alt="Network background" 
            className="h-full w-full object-cover"
          /> */}
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-4">
                ScaleUp Link
              </h1>
              <h2 className="text-2xl font-medium mb-6">
                Connecting Entrepreneurs & Investors
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                A professional platform designed to help entrepreneurs and investors connect,
                collaborate and grow through networking, events, and knowledge sharing.
              </p>
              <Button size="lg" className="bg-white text-orange-500 hover:bg-blue-50" onClick={() => navigate('/signin')}>
          Login to Your Account
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
            </div>
            
            <div className="hidden lg:block">
              <img 
                src="/src/assets/professions1.jpg" 
                alt="Platform preview" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What We Offer</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Our platform provides everything entrepreneurs and investors need to connect,
            share ideas, and grow their businesses.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-500" />
                For Entrepreneurs
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Create a professional profile showcasing your expertise
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Connect with potential investors
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Organize business events and networking opportunities
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Share updates through posts and stories
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Discover latest business news relevant to your field
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-orange-500" />
                For Investors
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Discover promising entrepreneurs and startups
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Evaluate business opportunities through detailed profiles
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Engage with posts and content from your network
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Attend industry events to expand your connections
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Access curated business news and market insights
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-orange-500" />
                Platform Benefits
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Secure messaging and connection system
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Event management with ratings and feedback
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Integrated payment system for event registrations
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Real-time news feed with industry-specific filters
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Mobile-responsive design for on-the-go access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Platform Features</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Discover all the tools and features we offer to help you succeed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Building className="h-6 w-6 text-orange-500" />}
              title="Professional Profiles"
              description="Create detailed profiles showcasing your expertise and interests"
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-orange-500" />}
              title="Posts & Stories"
              description="Share updates and engage with content from your network"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-orange-500" />}
              title="Events"
              description="Create and join business events and networking opportunities"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-orange-500" />}
              title="Networking"
              description="Connect with investors and fellow entrepreneurs"
            />
            <FeatureCard
              icon={<Wallet className="h-6 w-6 text-orange-500" />}
              title="Investment Opportunities"
              description="Find projects to invest in or secure funding for your venture"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-orange-500" />}
              title="Business News Feed"
              description="Stay updated with the latest news relevant to your industry"
            />
            <FeatureCard
              icon={<BarChart className="h-6 w-6 text-orange-500" />}
              title="Analytics"
              description="Track engagement and growth of your professional network"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-orange-500" />}
              title="Global Community"
              description="Connect with professionals from around the world"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-slate-600">Sign up and build your professional profile. Specify whether you're an entrepreneur or investor.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Connect & Engage</h3>
              <p className="text-slate-600">Post updates, share stories, and engage with content from other professionals in your network.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Collaborate & Grow</h3>
              <p className="text-slate-600">Attend events, form partnerships, and turn connections into opportunities for growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Success Stories</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Hear from entrepreneurs and investors who have achieved success through our platform.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial
              quote="Through this platform, I connected with an investor who not only funded my startup but also provided valuable mentorship that helped us scale rapidly."
              name="Sarah Johnson"
              role="Tech Entrepreneur"
            />
            <Testimonial
              quote="As an angel investor, I've discovered innovative startups and talented entrepreneurs here that I wouldn't have found elsewhere. The quality of connections has been exceptional."
              name="Michael Chen"
              role="Angel Investor"
            />
            <Testimonial
              quote="The events feature allowed me to organize industry meetups that attracted key players. These connections helped my business secure crucial partnerships."
              name="David Rodriguez"
              role="Business Owner"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-slate-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect and Grow?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs and investors already building valuable
            connections and growing their businesses.
          </p>
          <Button onClick={() => navigate("/signin")} size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-blue-50">
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
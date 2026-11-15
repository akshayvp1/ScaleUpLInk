import React from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useNavigate } from 'react-router-dom';
import MainImage from "../../assets/professions1.jpg"
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
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="h-full border-border/70 bg-card shadow-soft hover-lift">
      <CardContent className="flex flex-col items-start gap-4 p-6 text-left">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
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
    <Card className="h-full border-border/70 bg-card shadow-soft hover-lift">
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-5 flex gap-1 text-warning">
          {Array.from({ length: 5 }).map((_, index) => (
            <Sparkles key={index} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <p className="mb-6 flex-1 text-sm leading-relaxed text-foreground">"{quote}"</p>
        <div className="flex items-center">
          <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh overflow-hidden bg-background">
      <section className="relative overflow-hidden bg-sidebar px-4 py-20 text-sidebar-foreground sm:py-28 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.28),transparent_42%)]" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="container relative z-10 mx-auto">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-sidebar-foreground backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                The network for ambitious founders and investors
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl [font-family:var(--font-display)]">
                ScaleUp Link
              </h1>
              <h2 className="mb-6 text-xl font-medium text-sidebar-foreground/90 sm:text-2xl">
                Connecting Entrepreneurs &amp; Investors
              </h2>
              <p className="mb-8 max-w-xl text-base leading-relaxed text-sidebar-foreground/70 sm:text-lg">
                A professional platform designed to help entrepreneurs and investors connect,
                collaborate and grow through networking, events, and knowledge sharing.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="bg-white text-primary shadow-lg hover:bg-white/90"
                  onClick={() => navigate('/signin')}
                >
                  Login to Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <span className="text-xs text-sidebar-foreground/60">
                  Build meaningful business relationships
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-2xl" />
              <img
                src={MainImage}
                alt="Platform preview"
                className="relative w-full rounded-3xl border border-white/10 object-cover shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl [font-family:var(--font-display)]">
            What We Offer
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            Our platform provides everything entrepreneurs and investors need to connect,
            share ideas, and grow their businesses.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft hover-lift">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <Users className="mr-2 h-5 w-5 text-primary" />
                For Entrepreneurs
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Create a professional profile showcasing your expertise
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Connect with potential investors
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Organize business events and networking opportunities
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Share updates through posts and stories
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Discover latest business news relevant to your field
                </li>
              </ul>
            </div>
            
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft hover-lift">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <Wallet className="mr-2 h-5 w-5 text-primary" />
                For Investors
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Discover promising entrepreneurs and startups
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Evaluate business opportunities through detailed profiles
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Engage with posts and content from your network
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Attend industry events to expand your connections
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Access curated business news and market insights
                </li>
              </ul>
            </div>
            
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft hover-lift">
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Platform Benefits
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Secure messaging and connection system
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Event management with ratings and feedback
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Integrated payment system for event registrations
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Real-time news feed with industry-specific filters
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Mobile-responsive design for on-the-go access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border/60 bg-muted/35 px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl [font-family:var(--font-display)]">
            Platform Features
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            Discover all the tools and features we offer to help you succeed.
          </p>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Building className="h-6 w-6 text-primary" />}
              title="Professional Profiles"
              description="Create detailed profiles showcasing your expertise and interests"
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-primary" />}
              title="Posts & Stories"
              description="Share updates and engage with content from your network"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-primary" />}
              title="Events"
              description="Create and join business events and networking opportunities"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Networking"
              description="Connect with investors and fellow entrepreneurs"
            />
            <FeatureCard
              icon={<Wallet className="h-6 w-6 text-primary" />}
              title="Investment Opportunities"
              description="Find projects to invest in or secure funding for your venture"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              title="Business News Feed"
              description="Stay updated with the latest news relevant to your industry"
            />
            <FeatureCard
              icon={<BarChart className="h-6 w-6 text-primary" />}
              title="Analytics"
              description="Track engagement and growth of your professional network"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-primary" />}
              title="Global Community"
              description="Connect with professionals from around the world"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-primary/5 px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl [font-family:var(--font-display)]">
            How It Works
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Create Your Profile</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Sign up and build your professional profile. Specify whether you're an entrepreneur or investor.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">Connect & Engage</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Post updates, share stories, and engage with content from other professionals in your network.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Collaborate & Grow</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Attend events, form partnerships, and turn connections into opportunities for growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20">
        <div className="container mx-auto">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl [font-family:var(--font-display)]">
            Success Stories
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
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
      <section className="relative overflow-hidden bg-sidebar px-4 py-20 text-sidebar-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.22),transparent_55%)]" />
        <div className="container relative z-10 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl [font-family:var(--font-display)]">
            Ready to Connect and Grow?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-sidebar-foreground/70 sm:text-lg">
            Join thousands of entrepreneurs and investors already building valuable
            connections and growing their businesses.
          </p>
          <Button
            onClick={() => navigate("/signin")}
            size="lg"
            className="bg-white text-primary shadow-lg hover:bg-white/90"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
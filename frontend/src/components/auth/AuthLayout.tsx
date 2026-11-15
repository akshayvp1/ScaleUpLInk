import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, TrendingUp, Users } from "lucide-react";

import { cn } from "../../lib/utils";
import { Logo } from "../common/Logo";
import { ModeToggle } from "../mode-toggle";
import businessImg from "../../assets/business.jpg";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Verified network",
    description: "Connect with trusted investors and founders.",
  },
  {
    icon: TrendingUp,
    title: "Real opportunities",
    description: "Discover businesses that are ready to scale.",
  },
  {
    icon: Users,
    title: "Built for growth",
    description: "Everything you need to grow in one platform.",
  },
];

interface AuthLayoutProps {
  children: ReactNode;
  contentClassName?: string;
  brandEyebrow?: string;
  brandTitle?: string;
  brandSubtitle?: string;
}

export function AuthLayout({
  children,
  contentClassName,
  brandEyebrow = "ScaleUp Link",
  brandTitle = "Where ambitious founders meet the right investors.",
  brandSubtitle = "Discover opportunities, build your network, and scale your business with confidence.",
}: AuthLayoutProps) {
  return (
    <div className="bg-background grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex min-h-svh flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center"
            aria-label="ScaleUp Link home"
          >
            <Logo title="ScaleUp Link" />
          </Link>
          <ModeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className={cn("w-full max-w-md", contentClassName)}>
            {children}
          </div>
        </main>

        <footer className="text-muted-foreground shrink-0 px-4 py-4 text-center text-xs sm:px-6 lg:px-10">
          © {new Date().getFullYear()} ScaleUp Link. All rights reserved.
        </footer>
      </div>

      <aside className="bg-sidebar relative hidden overflow-hidden lg:flex lg:flex-col">
        <img
          src={businessImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="from-sidebar via-sidebar/90 to-primary/50 absolute inset-0 bg-gradient-to-br" />

        <div className="text-sidebar-foreground relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo title="ScaleUp Link" onDark />

          <div className="max-w-md space-y-6">
            <p className="text-sidebar-foreground/70 text-sm font-medium tracking-[0.2em] uppercase">
              {brandEyebrow}
            </p>
            <h2 className="text-3xl leading-tight font-bold xl:text-4xl">
              {brandTitle}
            </h2>
            <p className="text-sidebar-foreground/75 text-base leading-relaxed">
              {brandSubtitle}
            </p>

            <ul className="space-y-4 pt-2">
              {highlights.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {title}
                    </span>
                    <span className="text-sidebar-foreground/70 block text-sm">
                      {description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sidebar-foreground/50 text-xs">
            Trusted by founders and investors worldwide.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default AuthLayout;

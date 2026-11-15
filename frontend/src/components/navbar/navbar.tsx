import { Link } from "react-router-dom";

import { Logo } from "../common/Logo";
import { ModeToggle } from "../mode-toggle";

const Navbar = () => {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="ScaleUp Link home" className="inline-flex items-center">
          <Logo title="ScaleUp Link" />
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
};

export default Navbar;

import React from "react";
import logoNavabar from "../../assets/logo.png"

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 relative h-24">
      {/* Logo positioned absolutely */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
        <a href="/" className="block">
          <img
            src={logoNavabar}
            alt="Company Logo"
            className="h-40 w-auto"
          />  
        </a>
        
      </div>
    </header>
   
  );
};

export default Navbar;
import React from "react";

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 relative h-24">
      {/* Logo positioned absolutely */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
        <a href="/" className="block">
          <img
            src="src/assets/logo6.png"
            alt="Company Logo"
            className="h-40 w-auto"
          />  
        </a>
        
      </div>
    </header>
   
  );
};

export default Navbar;
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-black relative py-6 border-t border-white/10">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#ff0000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 z-0" />

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 flex items-center justify-between text-gray-300 text-sm">
        
   
          <span>
           © 2025 Department of CSE,{" "}
            <span className="font-semibold">EGSPEC</span>
          </span>
      
          
            <span className="text-red-400 font-semibold">INFxTRON’25</span>
   
      </div>
    </footer>
  );
};

export default Footer;

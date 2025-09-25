import React, { useState, useEffect } from 'react';
import {
  MdOutlineKeyboardDoubleArrowRight,
  MdMenu
} from "react-icons/md";

const NavBar = ({navItems,setMobileOpen}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  


  // 📦 Scroll listener for nav background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? "bg-black/30 backdrop-blur-md border-b border-white/10"
        : "bg-black"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <a href='#'>
                 <img
          src="/infxtron_logo.png"
          alt="Company Logo"
          className="w-32 h-12"
        />
              </a>
       

        {/* Desktop Nav Items */}
        <ul className="hidden md:flex text-[18px] font-bold items-center gap-5 text-gray-200">
          {navItems.map(({ name, path }, i) => (
            <li
              key={i}
              className="relative group cursor-pointer transition-all duration-100 hover:text-[#ff0000]"
            >
              <a href={path} >
                <span className="group-hover:scale-105 capitalize group-hover:-translate-y-0.5 inline-block transition-all duration-200">
                  {name}
                </span>
              </a>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#ff0000] group-hover:w-full transition-all duration-300"></span>
            </li>
          ))}
        </ul>

        {/* Register Button */}
        <a target="_blank" 
  rel="noopener noreferrer"
          href={import.meta.env.VITE_GOOGLE_SHEET_URL}
          className="mt-4 oi-regular hidden md:flex gap-1 uppercase font-bold md:mt-0 bg-gradient-to-r from-[#ff9aa2] via-[#ff5e6c] to-[#d80032] text-white px-4 py-2 rounded-full text-sm cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
        >
          Register <MdOutlineKeyboardDoubleArrowRight className="text-xl" />
        </a>

        {/* Mobile Hamburger Icon */}
        <div
          className="md:hidden text-3xl text-white cursor-pointer"
          onClick={() => setMobileOpen(true)}
        >
          <MdMenu />
        </div>
      </div>

      {/* Mobile Circular Menu */}
    
    </header>
  );
};

export default NavBar;

import React, { useState, useEffect } from 'react'
import { MdClose } from "react-icons/md";

const MobileNavBar = ({ mobileOpen, setMobileOpen, navItems }) => {
  const [showItems, setShowItems] = useState([]);

  useEffect(() => {
    if (mobileOpen) {
      // Reset showItems when mobile opens
      setShowItems([]);
      
      // Animate items one after another - FASTER
      navItems.forEach((_, index) => {
        setTimeout(() => {
          setShowItems(prev => [...prev, index]);
        }, index * 80); // Reduced from 150ms to 80ms
      });
    } else {
      // Reset when mobile closes
      setShowItems([]);
    }
  }, [mobileOpen, navItems]);

  return (
    <>
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center"
        >
          <div className="relative w-[300px] h-[300px] rounded-full flex items-center justify-center">
            {navItems.map(({ name, path, icon }, i) => {
              const angle = (i / navItems.length) * 2 * Math.PI - Math.PI / 2;
              const x = 120 * Math.cos(angle);
              const y = 120 * Math.sin(angle);
              
              const isVisible = showItems.includes(i);

              return (
                <a
                  key={i}
                  href={path}
                  onClick={() => setMobileOpen(false)}
                  className={`absolute flex flex-col items-center text-white text-sm font-semibold hover:scale-110 transition-all duration-300 ${
                    isVisible 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-50 translate-y-4'
                  }`}
                  style={{
                    left: `${150 + x}px`,
                    top: `${150 + y}px`,
                    transform: 'translate(-50%, -50%)',
                    transitionDelay: isVisible ? `${i * 50}ms` : '0ms', // Reduced from 100ms to 50ms
                  }}
                >
                  <span className="text-2xl p-3 rounded-full backdrop-blur-md bg-red-600/30 border border-white/20 shadow-md">
                    {icon}
                  </span>
                  <span className="capitalize tracking-wider font-light mt-1">
                    {name}
                  </span>
                </a>
              );
            })}

            {/* Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className={`absolute text-white p-3 rounded-full backdrop-blur-md bg-red-600/30 border border-white/20 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-all duration-300 ${
                showItems.length === navItems.length 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-50'
              }`}
              style={{
                transitionDelay: showItems.length === navItems.length ? '50ms' : '0ms' // Reduced from 100ms to 50ms
              }}
            >
              <MdClose />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileNavBar;
import React, { useEffect, useState } from "react";
import { ShoppingCart, LogIn, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from sessionStorage
  useEffect(() => {
    const updateCartCount = () => {
      const stored = JSON.parse(sessionStorage.getItem("cartItems")) || [];
      setCartCount(stored.length);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  // Smooth scroll navigation
  const handleScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll spy effect
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ["home", "about", "products", "contact"];
      let current = "home";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 120) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScrollSpy);
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  const linkClass = (id) =>
    `momo-sans text-base font-light transition-colors ${
      activeSection === id
        ? "text-black font-medium"
        : "text-gray-600 hover:text-black"
    }`;

  return (
    <header className="bg-white fixed top-0 left-0 w-full z-50 shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div
          onClick={() => handleScroll("home")}
          className="cursor-pointer flex items-center gap-2 z-10"
        >
          <img
            src="/AGHealthyFood.png"
            alt="AG's Healthy Food"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Center: Nav Links (Desktop Only) */}
        <nav className="hidden md:flex gap-10 z-10">
          <button onClick={() => handleScroll("home")} className={linkClass("home")}>
            Home
          </button>
          <button onClick={() => handleScroll("products")} className={linkClass("products")}>
            Products
          </button>
          <button onClick={() => handleScroll("about")} className={linkClass("about")}>
            About Us
          </button>
          <button onClick={() => handleScroll("contact")} className={linkClass("contact")}>
            Contact
          </button>
        </nav>

        {/* Right: Cart + Login (Desktop) */}
        <div className="hidden md:flex items-center gap-4 z-10">
          {/* Cart */}
          <div className="relative">
            <button
              className="text-gray-600 hover:text-black transition-colors"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart size={22} />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>

          {/* Login */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md momo-sans text-sm transition-colors"
          >
            <LogIn size={18} />
            <span>Login</span>
          </button>
        </div>

        {/* ✅ Mobile Icons */}
        <div className="md:hidden flex items-center justify-between w-16 z-10">
          {/* Cart */}
          <div className="relative flex justify-center items-center">
            <button
              onClick={() => navigate("/cart")}
              className="text-gray-700 hover:text-black transition-colors"
            >
              <ShoppingCart size={22} />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          {/* User */}
          <button
            onClick={() => navigate("/login")}
            className="text-gray-700 hover:text-black transition-colors flex justify-center items-center"
          >
            <User size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

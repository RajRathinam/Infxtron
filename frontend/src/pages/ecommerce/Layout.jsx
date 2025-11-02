import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Salad } from "lucide-react";

export default function EcommerceLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth scroll to a section (even when navigating from another page)
  const handleScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/"); // go back to home page
      // wait a bit for the page to load before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <main className="flex-grow mt-16">
        <Outlet />
      </main>

      <Footer />

      {/* 🥗 Floating Food Icon - Mobile Only */}
      <button
        className="
          md:hidden
          fixed
          bottom-6
          right-6
          bg-orange-500
          hover:bg-orange-600
          text-white
          p-4
          z-50
          rounded-full
          shadow-lg
          transition-all
          duration-300
          flex
          items-center
          justify-center
        "
        onClick={() => handleScroll("products")}
      >
        <Salad size={24} />
      </button>
    </div>
  );
}

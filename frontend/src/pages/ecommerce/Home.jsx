import React, { useState, useEffect } from "react";
import { ArrowRight, Leaf, Award, Truck, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import About from "./About";
import Contact from "./Contact";
import Products from "./Products";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [todaysSpecial, setTodaysSpecial] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine current day and time
  const now = new Date();
  const today = now.toLocaleDateString("en-US", { weekday: "long" });
  const hour = now.getHours();
  const isMorning = hour >= 7 && hour < 9;
  const isEvening = hour >= 16 && hour < 18;

  // Enhanced helper function to parse availableDay field
  const parseAvailableDay = (availableDay) => {
    if (!availableDay) return [];
    
    // If it's already an array, return it
    if (Array.isArray(availableDay)) return availableDay;
    
    // If it's a string, try to parse it
    if (typeof availableDay === 'string') {
      console.log("Raw availableDay string:", availableDay);
      
      // Method 1: Handle the specific malformed format: {"Saturday","Sunday","Monday"}
      if (availableDay.startsWith('{') && availableDay.endsWith('}')) {
        try {
          // Remove curly braces and split by commas
          const withoutBraces = availableDay.slice(1, -1);
          // Remove quotes and trim each day
          const days = withoutBraces.split(',').map(day => 
            day.replace(/"/g, '').trim()
          ).filter(day => day);
          console.log("Parsed days (method 1):", days);
          return days;
        } catch (error) {
          console.error('Error parsing with method 1:', error);
        }
      }
      
      // Method 2: Try JSON.parse for properly formatted arrays
      try {
        const parsed = JSON.parse(availableDay);
        if (Array.isArray(parsed)) {
          console.log("Parsed days (method 2 - JSON):", parsed);
          return parsed;
        }
      } catch (error) {
        console.log('JSON parse failed, trying other methods');
      }
      
      // Method 3: Simple comma splitting as fallback
      try {
        const days = availableDay.split(',').map(day => 
          day.replace(/[{"}]/g, '').trim()
        ).filter(day => day);
        console.log("Parsed days (method 3 - split):", days);
        return days;
      } catch (error) {
        console.error('Error parsing with method 3:', error);
      }
    }
    
    console.log("No days parsed, returning empty array");
    return [];
  };

  // Fetch today's special products from backend
  useEffect(() => {
    const fetchTodaysSpecials = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`);
        const data = await res.json();

        console.log("=== DEBUG INFO ===");
        console.log("Today is:", today);
        console.log("All products:", data);

        // Filter products that have today in their availableDay array
        let availableProducts = data.filter((product) => {
          const availableDays = parseAvailableDay(product.availableDay);
          console.log(`Product: ${product.productName}`);
          console.log(`Raw availableDay: ${product.availableDay}`);
          console.log(`Parsed days:`, availableDays);
          
          // Check if today is in the availableDay array (case insensitive)
          const isAvailableToday = availableDays.some(
            day => day.trim().toLowerCase() === today.toLowerCase()
          );
          
          console.log(`Available today? ${isAvailableToday}`);
          console.log('---');
          
          return isAvailableToday;
        });

        console.log("Available products after day filter:", availableProducts);

        // Filter by time slot if needed
        if (isMorning || isEvening) {
          availableProducts = availableProducts.filter((product) => {
            if (!product.availableTime) return false;
            const time = product.availableTime.toLowerCase();
            if (isMorning) return time.includes("morning");
            if (isEvening) return time.includes("evening");
            return true;
          });
          console.log("Available products after time filter:", availableProducts);
        }

        console.log("Final available products:", availableProducts);

        // Take only top 4 for the slider
        setTodaysSpecial(availableProducts.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch today's specials:", err);
        setTodaysSpecial([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysSpecials();
  }, [today, isMorning, isEvening]);

  // Prepare carousel images
  const carouselImages = todaysSpecial.length > 0 
    ? todaysSpecial.map((product) => ({
        src: product.imagePath,
        title: product.productName,
        subtitle: `${product.packName || "Meal Pack"} • ${product.weight || "100g"} • ${product.proteinIntake || "8g"} Protein`,
        product,
        isFallback: false,
      }))
    : [{
        src: "/poster.jpg",
        title: "Delicious Healthy Meals",
        subtitle: "Fresh organic meals prepared daily • Check back for today's specials",
        isFallback: true,
      }];

  // Auto-slide functionality (only for actual products, not for fallback)
  useEffect(() => {
    if (carouselImages.length === 0 || carouselImages[0].isFallback) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length, carouselImages[0]?.isFallback]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () =>
    setCurrentSlide((prev) =>
      (prev - 1 + carouselImages.length) % carouselImages.length
    );

  return (
    <div>
      {/* Home Section with Carousel */}
      <section
        id="home"
        className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50 relative pt-4 px-4 sm:px-6 md:px-16 flex flex-col items-center justify-center"
      >
        <div className="w-full max-w-7xl mx-auto mb-8 md:mb-12">
          {/* Hero Content */}
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-amber-50 rounded-full border border-amber-100 text-sm md:text-base font-semibold text-amber-600 mb-4">
                <Leaf size={16} className="text-amber-600" />
                Fresh from Nature
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mb-6"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0  blur-3xl opacity-30 -z-10 rounded-full"></div>
                <span className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black ubuntu leading-tight block">
                  <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 bg-clip-text text-transparent">
                    AG's
                  </span>
                  <br />
                  <span className="text-black">
                    Healthy
                  </span>
                  <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    Food
                  </span>
                </span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-40 md:w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full"></div>
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xs sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Discover our range of organic, fresh, and nutritious meals delivered daily to your doorstep.
            </motion.p>
      
          </div>

          {/* Carousel Container */}
          {loading ? (
            <div className="w-full h-[280px] sm:h-[400px] md:h-[500px] rounded-[2rem] bg-gray-200 animate-pulse flex items-center justify-center">
              <p className="text-gray-500">Loading today's specials...</p>
            </div>
          ) : (
            <div className="relative w-full mb-8 md:mb-12">
              <div className="absolute -inset-2 rounded-[2rem] blur-2xl opacity-40 animate-pulse"></div>
              <motion.div
                className="relative w-full h-[280px] sm:h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden border-2 border-emerald-100/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <div className="relative h-full">
                      <img
                        src={carouselImages[currentSlide].src}
                        alt={carouselImages[currentSlide].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      
                      {/* Today's Special Badge - Only show for actual products */}
                      {!carouselImages[currentSlide].isFallback && (
                        <div className="absolute top-6 left-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                          <Star size={12} className="fill-white" />
                          <span className="text-xs font-bold">Today's Special</span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-black mb-1">
                          {carouselImages[currentSlide].title}
                        </h3>
                        <p className="text-sm font-medium opacity-90 mb-2">
                          {carouselImages[currentSlide].subtitle}
                        </p>
                        {carouselImages[currentSlide].isFallback && (
                          <p className="text-xs opacity-75">
                            No specials available today. Check our full menu below!
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons - Only show if there are multiple slides */}
                {carouselImages.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all active:scale-95 z-10"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={20} className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all active:scale-95 z-10"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={20} className="text-gray-800" />
                    </button>
                  </>
                )}

                {/* Dots Indicator - Only show if there are multiple slides */}
                {carouselImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div className="bg-emerald-50 rounded-xl p-3 inline-block mb-2">
                <Leaf size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">100% Organic</h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div className="bg-amber-50 rounded-xl p-3 inline-block mb-2">
                <Truck size={24} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Daily Delivery</h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div className="bg-teal-50 rounded-xl p-3 inline-block mb-2">
                <Award size={24} className="text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Premium Quality</h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div className="bg-rose-50 rounded-xl p-3 inline-block mb-2">
                <Heart size={24} className="text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Loved by Customers</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <Products />
      <Contact />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Leaf, Award, Truck, Heart, Star, ChevronLeft, ChevronRight, CalendarDays, Clock, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import About from "./About";
import Contact from "./Contact";
import Products from "./Products";
import { allProductsData } from "../../data/products";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);
  
  // Get featured products (first 4)
  const featuredProducts = allProductsData.slice(0, 4);
  const displayedProducts = showAllProducts ? allProductsData : featuredProducts;

  // Product data for carousel (today's special)
  const allProducts = [
    // Sprouts Salads
    { 
      productName: "Moong Sprouts Salad", 
      packName: "Meal Pack", 
      weight: "100g", 
      protein: "8g", 
      availableDays: ["Monday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 50,
      image: "/assets/21.png"
    },
    { 
      productName: "Multigrain Sprouts Salad", 
      packName: "Meal Pack", 
      weight: "100g", 
      protein: "8g", 
      availableDays: ["Tuesday", "Saturday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 50,
      image: "/assets/21.png"
    },
    { 
      productName: "Chana Sprouts Salad", 
      packName: "Meal Pack", 
      weight: "100g", 
      protein: "8g", 
      availableDays: ["Wednesday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 50,
      image: "/assets/22.png"
    },
    { 
      productName: "Green Chickpeas Sprouts Salad", 
      packName: "Meal Pack", 
      weight: "100g", 
      protein: "8g", 
      availableDays: ["Thursday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 50,
      image: "/assets/22.png"
    },
    { 
      productName: "Kidney Beans Sprouts Salad", 
      packName: "Meal Pack", 
      weight: "100g", 
      protein: "8g", 
      availableDays: ["Friday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 50,
      image: "/assets/21.png"
    },
    // Other Salads
    { 
      productName: "24 Hrs Soaked Groundnut Salad", 
      packName: "Normal Pack", 
      weight: "100g", 
      protein: "26g", 
      availableDays: ["Tuesday", "Thursday", "Saturday"], 
      time: "Morning 07:00 AM - 08:30 AM",
      price: 50,
      image: "/assets/22.png"
    },
    { 
      productName: "24 Hrs Soaked Badam Salad", 
      packName: "Normal Pack", 
      weight: "100g", 
      protein: "22g", 
      availableDays: ["Monday", "Wednesday", "Friday"], 
      time: "Morning 07:00 AM - 08:30 AM",
      price: 100,
      image: "/assets/22.png"
    },
    { 
      productName: "Egg Salad", 
      packName: "Meal Pack (5 Eggs)", 
      weight: "5 Eggs", 
      protein: "30g", 
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 75,
      image: "/assets/9.png"
    },
    { 
      productName: "Italian Omelette", 
      packName: "Meal Pack", 
      weight: "2 Eggs", 
      protein: "12g", 
      availableDays: ["Wednesday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 40,
      image: "/assets/8.png"
    },
    { 
      productName: "Chicken Salad", 
      packName: "Meal Pack", 
      weight: "150g", 
      protein: "42g", 
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], 
      time: "Evening 04:30 PM - 06:00 PM",
      price: 100,
      image: "/assets/9.png"
    },
  ];

  // Get today's special products based on current day
  const getTodaysSpecial = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = new Date().getHours();
    
    // Determine if it's morning or evening
    const isMorning = currentHour >= 7 && currentHour < 9;
    const isEvening = currentHour >= 16 && currentHour < 18;
    
    let availableProducts = allProducts.filter(product => {
      const isAvailableToday = product.availableDays.includes(today);
      
      // Check time slot
      if (isMorning) {
        return isAvailableToday && product.time.includes("Morning");
      } else if (isEvening) {
        return isAvailableToday && product.time.includes("Evening");
      } else {
        // Default to evening products if not in time slot
        return isAvailableToday && product.time.includes("Evening");
      }
    });

    // If no products match time, show any available today
    if (availableProducts.length === 0) {
      availableProducts = allProducts.filter(product => 
        product.availableDays.includes(today)
      );
    }

    return availableProducts.slice(0, 4);
  };

  const todaysSpecial = getTodaysSpecial();
  
  // Create carousel images from today's special
  const carouselImages = todaysSpecial.length > 0 
    ? todaysSpecial.map(product => ({
        src: product.image,
        title: product.productName,
        subtitle: `${product.packName} • ${product.weight} • ${product.protein} Protein`,
        product: product
      }))
    : [
        {
          src: "/assets/21.png",
          title: "Fresh & Healthy",
          subtitle: "100% Organic Products"
        },
        {
          src: "/assets/22.png",
          title: "Nutritious Meals",
          subtitle: "Premium Quality Food"
        },
        {
          src: "/assets/9.png",
          title: "Daily Fresh",
          subtitle: "Delivered with Care"
        }
      ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div>
      {/* Home Section with Carousel */}
      <section
        id="home"
        className="min-h-screen bg-white relative pt-4 px-4 sm:px-6 md:px-16 flex flex-col items-center justify-center"
      >
        {/* Hero Content */}
        <div className="w-full max-w-7xl mx-auto mb-8 md:mb-12">
          <div className="text-center mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-sm md:text-base font-semibold text-amber-600 mb-4">
              <Leaf size={16} className="text-amber-600" />
              Fresh from Nature
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 ubuntu">
              Healthy Food for{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Healthy Life
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our range of organic, fresh, and nutritious meals delivered daily to your doorstep.
            </p>
          </div>

          {/* Carousel Container with Green Glow */}
          <div className="relative w-full mb-8 md:mb-12">
            {/* Green Glow Shadow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-[2rem] blur-2xl opacity-40 animate-pulse"></div>
            
            {/* Carousel */}
            <motion.div
              className="relative w-full h-[280px] sm:h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden border-2 border-emerald-100/50 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.5)]"
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
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Today's Special Badge */}
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                      <Star size={12} className="fill-white" />
                      <span className="text-xs font-bold">Today's Special</span>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-black mb-1">{carouselImages[currentSlide].title}</h3>
                      <p className="text-sm font-medium opacity-90 mb-2">{carouselImages[currentSlide].subtitle}</p>
                      {carouselImages[currentSlide].product && (
                        <p className="text-xs font-semibold opacity-80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                          {carouselImages[currentSlide].product.time}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
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

              {/* Dots Indicator */}
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
            </motion.div>
          </div>

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
              <h3 className="font-bold text-gray-900 text-sm">Made with Love</h3>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <span>Order Now</span>
              <ArrowRight size={20} className="animate-bounce-x" />
            </button>
            <button
              onClick={() => {
                setTimeout(() => {
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-2xl font-bold text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3"
            >
              <span>Explore Products</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products-preview" className="py-12 md:py-16 px-4 sm:px-6 md:px-16 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xl sm:text-2xl md:text-3xl dancing-script text-orange-600 font-semibold">
              Our Products
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-emerald-600 ubuntu mt-2">
              Wholesome. Organic. Fresh.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 md:mt-3 max-w-2xl mx-auto">
              Explore our curated range of healthy food products. Click on any product to see all pack options and subscription plans.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 mb-8">
            {displayedProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => {
                  setTimeout(() => {
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-full h-48 sm:h-52 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] sm:text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold">
                    {product.packs.length} Pack Options
                  </div>
                </div>

                <div className="p-4 md:p-5 flex flex-col space-y-3">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                    {product.productName}
                  </h3>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 items-center">
                    <div className="flex items-center gap-1">
                      <CalendarDays size={14} className="text-emerald-600" />
                      <span>
                        {product.availableDays.length === 6
                          ? "Mon - Sat"
                          : product.availableDays.length === 1
                          ? product.availableDays[0]
                          : product.availableDays.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-600" />
                      <span className="text-[10px]">{product.time}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Starting from:</p>
                    <p className="text-base md:text-lg font-bold text-emerald-600">
                      ₹{product.packs[0].singleOrder}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Weekly: ₹{product.packs[0].weeklySubscription} | Monthly: ₹{product.packs[0].monthlySubscription}
                    </p>
                  </div>

                  <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95">
                    <Package size={16} />
                    <span>View Pack Options</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View More Button */}
          {!showAllProducts && (
            <div className="text-center">
              <button
                onClick={() => setShowAllProducts(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <span>View All Products</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {showAllProducts && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setShowAllProducts(false);
                  document.getElementById("products-preview")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-2xl font-bold text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <span>Show Less</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Full Products Section */}
      <section id="products">
        <Products />
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>

      {/* Contact Section */}
      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}

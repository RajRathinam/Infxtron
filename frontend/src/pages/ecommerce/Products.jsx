import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  ShoppingBasket,
  Dumbbell,
  CalendarDays,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  FileText,
  X // Added X icon for closing the modal
} from "lucide-react";

const Products = () => {
  const [quantities, setQuantities] = useState({});
  const [selectedType, setSelectedType] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showGoogleForm, setShowGoogleForm] = useState(false); // State to control form visibility
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL; // Make sure this env variable exists

  // Get today's day
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Helper function to parse availableDay field (same as in Home component)
  const parseAvailableDay = (availableDay) => {
    if (!availableDay) return [];
    
    // If it's already an array, return it
    if (Array.isArray(availableDay)) return availableDay;
    
    // If it's a string, try to parse it
    if (typeof availableDay === 'string') {
      // Handle the specific malformed format: {"Saturday","Sunday","Monday"}
      if (availableDay.startsWith('{') && availableDay.endsWith('}')) {
        try {
          // Remove curly braces and split by commas
          const withoutBraces = availableDay.slice(1, -1);
          // Remove quotes and trim each day
          const days = withoutBraces.split(',').map(day => 
            day.replace(/"/g, '').trim()
          ).filter(day => day);
          return days;
        } catch (error) {
          // Continue to next method if this fails
        }
      }
      
      // Try JSON.parse for properly formatted arrays
      try {
        const parsed = JSON.parse(availableDay);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Continue to next method if this fails
      }
      
      // Simple comma splitting as fallback
      try {
        const days = availableDay.split(',').map(day => 
          day.replace(/[{"}]/g, '').trim()
        ).filter(day => day);
        return days;
      } catch (error) {
        // Return empty array if all methods fail
      }
    }
    
    return [];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products`);
        const data = await res.json();
        setProducts(data || []);
        
        // Filter products that are available today using the parsing function
        const todayProducts = data.filter((product) => {
          const availableDays = parseAvailableDay(product.availableDay);
          
          // Check if today is in the availableDay array (case insensitive)
          return availableDays.some(
            day => day.trim().toLowerCase() === today.toLowerCase()
          );
        });
        
        setFilteredProducts(todayProducts);
      } catch {
        setProducts([]);
        setFilteredProducts([]);
      }
    };
    fetchProducts();
  }, [BASE_URL, today]);

  const handleIncrease = (index) => {
    setQuantities((prev) => ({
      ...prev,
      [index]: (prev[index] || 1) + 1,
    }));
  };

  const handleDecrease = (index) => {
    setQuantities((prev) => ({
      ...prev,
      [index]: prev[index] > 1 ? prev[index] - 1 : 1,
    }));
  };

  const handleTypeChange = (index, type) => {
    setSelectedType((prev) => ({
      ...prev,
      [index]: type,
    }));
  };

  const getPrice = (product, index) => {
    const type = selectedType[index] || "singleOrder";
    if (type === "weeklySubscription") return product.weeklySubscription;
    if (type === "monthlySubscription") return product.monthlySubscription;
    return product.singleOrder;
  };

  const handleAddToCart = (product, index) => {
    const qty = quantities[index] || 1;
    const orderType = selectedType[index] || "singleOrder";
    const price =
      orderType === "weeklySubscription"
        ? product.weeklySubscription
        : orderType === "monthlySubscription"
        ? product.monthlySubscription
        : product.singleOrder;

    const existing = JSON.parse(sessionStorage.getItem("cartItems")) || [];

    // Check if the same product with same order type already exists in cart
    const existingProductIndex = existing.findIndex(
      (item) => item.productId === product.id && item.orderType === orderType
    );

    if (existingProductIndex > -1) {
      // Product already exists in cart with same order type
      Swal.fire({
        title: "Product Already in Cart!",
        text: `${product.productName} (${getOrderTypeLabel(orderType)}) is already in your cart. You can update the quantity from the cart.`,
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "OK",
      });
      return;
    }

    const cartItem = {
      ...product,
      _id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: qty,
      orderType: orderType,
      price: price,
      productId: product.id,
      productName: product.productName,
      packName: product.packName,
    };

    existing.push(cartItem);
    sessionStorage.setItem("cartItems", JSON.stringify(existing));
    window.dispatchEvent(new Event("cartUpdated"));

    Swal.fire({
      title: "Added to Cart!",
      text: `${product.productName} (${getOrderTypeLabel(orderType)}) x${qty} added to your cart.`,
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "OK",
    });
  };

  // Helper function to get display label for order type
  const getOrderTypeLabel = (orderType) => {
    switch (orderType) {
      case "weeklySubscription":
        return "Weekly Plan";
      case "monthlySubscription":
        return "Monthly Plan";
      default:
        return "Single Order";
    }
  };

  // Format availableDay array for display using the parsing function
  const formatAvailableDays = (availableDay) => {
    const days = parseAvailableDay(availableDay);
    if (days.length === 0) return "Not available";
    return days.join(", ");
  };

  // Function to handle opening the Google Form
  const handleOpenGoogleForm = () => {
    setShowGoogleForm(true);
  };

  // Function to handle closing the Google Form
  const handleCloseGoogleForm = () => {
    setShowGoogleForm(false);
  };

  return (
    <section
      id="products"
      className="min-h-screen px-6 md:px-16 py-16 text-gray-800 overflow-hidden relative"
    >
      {/* Google Form Modal */}
      {showGoogleForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
              <h3 className="text-xl font-bold text-gray-800">
                Customized Diet Plan Form
              </h3>
              <button
                onClick={handleCloseGoogleForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              {GOOGLE_FORM_URL ? (
                <iframe 
                  src={GOOGLE_FORM_URL} 
                  width="100%" 
                  height="1122" 
                  frameBorder="0"
                  marginHeight="0" 
                  marginWidth="0"
                  className="w-full"
                >
                  Loading…
                </iframe>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-500">Google Form URL not configured.</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Please check your environment variables.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="text-start mb-8 md:mb-12">
        <span className="text-xl sm:text-2xl md:text-3xl dancing-script text-orange-600 font-semibold">
          Today's Products
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 ubuntu">
          Wholesome.{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Organic. Fresh.
          </span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 md:mt-3 max-w-2xl">
          Explore our products available for <span className="font-semibold text-emerald-600">{today}</span>. 
          {filteredProducts.length === 0 && " Check back tomorrow for fresh offerings!"}
        </p>
        
        {/* Show message when no products available today */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              No products available for {today}. Please check back on other days or view our full product catalog.
            </p>
          </div>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={product.imagePath}
                  alt={product.productName}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#6dce00]/80 text-white text-xs px-3 py-1 rounded-full shadow">
                  {product.packName}
                </span>
                {/* Today's availability badge */}
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow">
                  Available Today
                </span>
              </div>

              <div className="p-5 flex flex-col space-y-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {product.productName}
                </h3>
                <p className="text-xs text-gray-500">{product.description}</p>

                <div className="flex flex-wrap gap-4 text-[12px] text-gray-600 mt-2 items-center">
                  <div className="flex items-center gap-1">
                    <ShoppingBasket size={14} className="text-[#6dce00]" />
                    <span>{product.weight}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell size={14} className="text-[#6dce00]" />
                    <span>{product.proteinIntake}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-[#6dce00]" />
                    <span>{formatAvailableDays(product.availableDay)}</span>
                  </div>
                </div>

                <div className="mt-2 flex gap-3 text-xs text-gray-700">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`type-${index}`}
                      checked={
                        (selectedType[index] || "singleOrder") === "singleOrder"
                      }
                      onChange={() => handleTypeChange(index, "singleOrder")}
                      className="accent-[#6dce00]"
                    />
                    Single
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`type-${index}`}
                      checked={selectedType[index] === "weeklySubscription"}
                      onChange={() =>
                        handleTypeChange(index, "weeklySubscription")
                      }
                      className="accent-[#6dce00]"
                    />
                    Weekly
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`type-${index}`}
                      checked={selectedType[index] === "monthlySubscription"}
                      onChange={() =>
                        handleTypeChange(index, "monthlySubscription")
                      }
                      className="accent-[#6dce00]"
                    />
                    Monthly
                  </label>
                </div>

                <p className="text-sm font-semibold text-[#6dce00] mt-1">
                  ₹{getPrice(product, index)}{" "}
                  <span className="text-xs text-gray-500">/ item</span>
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrease(index)}
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {quantities[index] || 1}
                    </span>
                    <button
                      onClick={() => handleIncrease(index)}
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product, index)}
                    className="bg-[#6dce00]/80 text-white text-sm py-2 px-3 rounded-full hover:bg-[#5abb00] transition-all flex items-center gap-1"
                  >
                    <ShoppingCart size={15} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Show message when no products are available today
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <CalendarDays size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No Products Available Today
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              There are no products available for {today}. Please check back on other days or contact us for special orders.
            </p>
            <div className="text-xs text-gray-500">
              Available days vary by product. Check individual product details for availability.
            </div>
          </div>
        </div>
      )}

      {/* Customized Diet Plan Section */}
      <div className="mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 md:p-10 border-2 border-emerald-100 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Customized Diet Plan
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Need a personalized meal plan? Get a customized diet plan tailored to
            your health goals and preferences.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleOpenGoogleForm}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-sm md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
          >
            <span>Get Customized Diet Plan</span>
            <ArrowRight size={20} />
          </button>
          <p className="text-xs sm:text-sm text-gray-600">
            Contact us for personalized consultation
          </p>
        </div>
      </div>

      {/* Product Catalog PDF Section */}
      <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 md:p-10 border-2 border-amber-100 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Complete Product Catalog
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Want to explore our entire product range? Download our complete catalog with all available products, 
            subscription plans, and detailed nutritional information.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/PDF_AGS.pdf" target="_blank" rel="noopener noreferrer">
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-sm md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <FileText size={20} />
              <span>Download Product Catalog</span>
            </button>
          </a>
          <p className="text-xs sm:text-sm text-gray-600">
            View our complete product offerings
          </p>
        </div>
      </div>
    </section>
  );
};

export default Products;
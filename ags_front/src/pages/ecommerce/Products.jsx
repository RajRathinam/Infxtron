import React, { useEffect, useState, useRef } from "react";
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
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Info,
  Lightbulb
} from "lucide-react";

const Products = () => {
  const [quantities, setQuantities] = useState({});
  const [selectedType, setSelectedType] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pendingAddToCart, setPendingAddToCart] = useState(null);
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const GOOGLE_FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL;

  // Refs for scrolling
  const datePickerRef = useRef(null);
  const productsRef = useRef(null);

  // Check if current time is past cutoff (2 PM)
  const checkCutoffTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 14; // 2 PM or later
  };

  // Get appropriate start date based on cutoff time
  const getStartDate = () => {
    const now = new Date();
    const isPastCutoff = checkCutoffTime();
    
    if (isPastCutoff) {
      // After 2 PM, start from tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } else {
      // Before 2 PM, start from today
      return now.toISOString().split('T')[0];
    }
  };

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get day name from date string
  const getDayFromDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Get short day name (Mon, Tue, etc.)
  const getShortDayName = (fullDayName) => {
    const dayMap = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[fullDayName] || fullDayName;
  };

  // Helper function to parse availableDay field
  const parseAvailableDay = (availableDay) => {
    if (!availableDay) return [];
    
    if (Array.isArray(availableDay)) return availableDay;
    
    if (typeof availableDay === 'string') {
      if (availableDay.startsWith('{') && availableDay.endsWith('}')) {
        try {
          const withoutBraces = availableDay.slice(1, -1);
          const days = withoutBraces.split(',').map(day => 
            day.replace(/"/g, '').trim()
          ).filter(day => day);
          return days;
        } catch (error) {
          // Continue to next method
        }
      }
      
      try {
        const parsed = JSON.parse(availableDay);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Continue to next method
      }
      
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

  // Clear cart function
  const clearCart = () => {
    sessionStorage.removeItem("cartItems");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Scroll to date picker
  const scrollToDatePicker = () => {
    if (datePickerRef.current) {
      datePickerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      // Highlight the date picker
      datePickerRef.current.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2');
      setTimeout(() => {
        datePickerRef.current.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2');
      }, 2000);
    }
  };

  // Scroll to products
  const scrollToProducts = () => {
    if (productsRef.current) {
      setTimeout(() => {
        productsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  };

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products`);
        const data = await res.json();
        setProducts(data || []);
        setFilteredProducts(data || []); // Show all products initially
        setIsInitialLoad(false);
      } catch {
        setProducts([]);
        setFilteredProducts([]);
        setIsInitialLoad(false);
      }
    };
    fetchProducts();
  }, [BASE_URL]);

  // Filter products by selected date
  const filterProductsByDate = (productsArray, date) => {
    const selectedDay = getDayFromDate(date);
    const availableProducts = productsArray.filter((product) => {
      const availableDays = parseAvailableDay(product.availableDay);
      return availableDays.some(
        day => day.trim().toLowerCase() === selectedDay.toLowerCase()
      );
    });
    setFilteredProducts(availableProducts);
    setVisibleCount(10);
  };

  // Handle date change - CLEARS CART when date changes
  const handleDateChange = (date) => {
    // Check if cart has items and show confirmation if changing date
    const existingCart = JSON.parse(sessionStorage.getItem("cartItems")) || [];
    if (existingCart.length > 0 && selectedDate !== date) {
      Swal.fire({
        title: "Change Delivery Date?",
        text: "Changing the delivery date will clear your current cart items. Do you want to continue?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Change Date",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear cart and set new date
          clearCart();
          setSelectedDate(date);
          filterProductsByDate(products, date);
          setShowDatePicker(false);
          
          // Scroll back to products after date selection
          scrollToProducts();
          
          Swal.fire({
            title: "Cart Cleared!",
            text: "Your cart has been cleared for the new delivery date.",
            icon: "info",
            confirmButtonColor: "#f59e0b",
          });
        }
      });
    } else {
      // No items in cart or same date selected, just proceed
      setSelectedDate(date);
      filterProductsByDate(products, date);
      setShowDatePicker(false);
      
      // Scroll back to products after date selection
      scrollToProducts();
    }
  };

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
    if (!selectedDate) {
      // Store the pending add to cart action
      setPendingAddToCart({ product, index });
      
      // Scroll to date picker and show message
      scrollToDatePicker();
      
      Swal.fire({
        title: "Select Delivery Date",
        text: "Please select your preferred delivery date to add this product to cart.",
        icon: "info",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "OK",
      });
      return;
    }

    sessionStorage.setItem('selectedDeliveryDate', selectedDate);
    
    // If date is selected, add to cart directly
    finalizeAddToCart(product, index);
  };

  // Final add to cart after date selection
  const finalizeAddToCart = (product, index) => {
    const qty = quantities[index] || 1;
    const orderType = selectedType[index] || "singleOrder";
    const price = getPrice(product, index);

    const existing = JSON.parse(sessionStorage.getItem("cartItems")) || [];

    // Check if the same product with same order type and date already exists in cart
    const existingProductIndex = existing.findIndex(
      (item) => 
        item.productId === product.id && 
        item.orderType === orderType && 
        item.deliveryDate === selectedDate
    );

    if (existingProductIndex > -1) {
      Swal.fire({
        title: "Product Already in Cart!",
        text: `${product.productName} (${getOrderTypeLabel(orderType)}) for ${selectedDate} is already in your cart.`,
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
      deliveryDate: selectedDate,
      deliveryDay: getDayFromDate(selectedDate)
    };

    existing.push(cartItem);
    sessionStorage.setItem("cartItems", JSON.stringify(existing));
    window.dispatchEvent(new Event("cartUpdated"));

    Swal.fire({
      title: "Added to Cart!",
      text: `${product.productName} (${getOrderTypeLabel(orderType)}) x${qty} for ${selectedDate} added to cart.`,
      icon: "success",
      confirmButtonColor: "#10b981",
      confirmButtonText: "OK",
    });
  };

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

  // Format availableDay array for display with short names
  const formatAvailableDays = (availableDay) => {
    const days = parseAvailableDay(availableDay);
    if (days.length === 0) return "Not available";
    return days.map(day => getShortDayName(day)).join(", ");
  };

  const handleOpenGoogleForm = () => {
    setShowGoogleForm(true);
  };

  const handleCloseGoogleForm = () => {
    setShowGoogleForm(false);
  };

  const loadMoreProducts = () => {
    setVisibleCount(prev => prev + 10);
  };

  const showLessProducts = () => {
    setVisibleCount(10);
  };

  // Generate dates for the next 7 days starting from appropriate date
  const getNextWeekDates = () => {
    const dates = [];
    const startDate = getStartDate(); // Get start date based on cutoff time
    const startDateObj = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDateObj);
      date.setDate(startDateObj.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getNextWeekDates();

  return (
    <section
      id="products"
      className="min-h-screen px-4 sm:px-6 md:px-16 py-12 text-gray-800 overflow-hidden relative"
    >
      {/* Google Form Modal */}
      {showGoogleForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                Customized Diet Plan Form
              </h3>
              <button
                onClick={handleCloseGoogleForm}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
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
                  <p className="text-red-500 text-sm">Google Form URL not configured.</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Please check your environment variables.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Date Picker Section */}
      <div 
        ref={datePickerRef}
        id="date-picker-section" 
        className="mb-8 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md border border-gray-100 transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-2">
                <Calendar size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Delivery Date</span>
              </div>
              <p className="text-xs text-gray-500">
                {checkCutoffTime() 
                  ? "Orders after 2 PM will be delivered from tomorrow"
                  : "Orders before 2 PM can be delivered today"}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 pb-2">
              {/* First row: 3 dates */}
              <div className="flex justify-between gap-2">
                {weekDates.slice(0, 3).map((date) => {
                  const dayName = getDayFromDate(date);
                  const shortDayName = getShortDayName(dayName);
                  const isSelected = selectedDate === date;
                  const dateObj = new Date(date);
                  const dayNumber = dateObj.getDate();
                  const isToday = date === getStartDate();
                  
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateChange(date)}
                      className={`
                        flex-1 p-4 rounded-lg border transition-all duration-200
                        flex flex-col items-center justify-center group relative
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                        }
                      `}
                    >
                      {isToday && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                      )}
                      
                      <div className={`
                        text-[10px] font-semibold uppercase
                        ${isSelected ? 'text-white' : 'text-gray-500'}
                      `}>
                        {shortDayName}
                      </div>
                      
                      <div className={`
                        text-base my-1 font-bold
                        ${isSelected ? 'text-white' : 'text-gray-800'}
                      `}>
                        {dayNumber}
                      </div>
                      
                      <div className={`
                        text-[9px] font-medium
                        ${isSelected ? 'text-emerald-100' : 'text-gray-400'}
                      `}>
                        {new Date(date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Second row: 3 dates */}
              <div className="flex justify-between gap-2">
                {weekDates.slice(3, 6).map((date) => {
                  const dayName = getDayFromDate(date);
                  const shortDayName = getShortDayName(dayName);
                  const isSelected = selectedDate === date;
                  const dateObj = new Date(date);
                  const dayNumber = dateObj.getDate();
                  const isToday = date === getStartDate();
                  
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateChange(date)}
                      className={`
                        flex-1 p-4 rounded-lg border transition-all duration-200
                        flex flex-col items-center justify-center group relative
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                        }
                      `}
                    >
                      {isToday && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                      )}
                      
                      <div className={`
                        text-[10px] font-semibold uppercase
                        ${isSelected ? 'text-white' : 'text-gray-500'}
                      `}>
                        {shortDayName}
                      </div>
                      
                      <div className={`
                        text-base my-1 font-bold
                        ${isSelected ? 'text-white' : 'text-gray-800'}
                      `}>
                        {dayNumber}
                      </div>
                      
                      <div className={`
                        text-[9px] font-medium
                        ${isSelected ? 'text-emerald-100' : 'text-gray-400'}
                      `}>
                        {new Date(date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Third row: 1 date (centered) */}
              <div className="flex justify-center">
                {weekDates.slice(6, 7).map((date) => {
                  const dayName = getDayFromDate(date);
                  const shortDayName = getShortDayName(dayName);
                  const isSelected = selectedDate === date;
                  const dateObj = new Date(date);
                  const dayNumber = dateObj.getDate();
                  const isToday = date === getStartDate();
                  
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateChange(date)}
                      className={`
                        w-full p-4 rounded-lg border transition-all duration-200
                        flex flex-col items-center justify-center group relative
                        ${isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                        }
                      `}
                    >
                      {isToday && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                      )}
                      
                      <div className={`
                        text-[10px] font-semibold uppercase
                        ${isSelected ? 'text-white' : 'text-gray-500'}
                      `}>
                        {shortDayName}
                      </div>
                      
                      <div className={`
                        text-base my-1 font-bold
                        ${isSelected ? 'text-white' : 'text-gray-800'}
                      `}>
                        {dayNumber}
                      </div>
                      
                      <div className={`
                        text-[9px] font-medium
                        ${isSelected ? 'text-emerald-100' : 'text-gray-400'}
                      `}>
                        {new Date(date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div> 
          
          <div className="flex-shrink-0">
            <div className="bg-blue-50 flex items-center gap-2 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Selected Date:</span>
              </div>
              <p className="text-xs text-blue-700">
                {selectedDate ? (
                  <div className=" flex gap-2">
                    <span>{getDayFromDate(selectedDate)}</span>
                
                    <span className="text-blue-600">{selectedDate}</span>
                  </div>
                ) : (
                  <div className="">No date selected</div>
                )}
              </p>
            </div>
          </div>
        </div>

   
      </div>

      {/* Products Section with ref */}
      <div ref={productsRef}>
        {/* Header Section */}
        <div className="text-start mb-8">
          <span className="text-lg sm:text-xl md:text-2xl dancing-script text-orange-600 font-semibold">
            Fresh & Healthy Choices
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 ubuntu">
            Wholesome.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Organic. Fresh.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
            {selectedDate ? (
              <div className="flex items-center gap-1">
                <CalendarDays size={14} className="text-emerald-600" />
                Showing products available for <span className="font-semibold text-emerald-600 ml-1">{getDayFromDate(selectedDate)}</span> delivery
              </div>
            ) : (
              "Browse all our fresh products - select a delivery date to check availability"
            )}
          </p>
          
      
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, visibleCount).map((product, index) => (
                <motion.div
                  key={product.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={product.imagePath}
                      alt={product.productName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-[#6dce00]/90 text-white text-[10px] px-2 py-1 rounded-full shadow">
                      {product.packName}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col space-y-2">
                    <h3 className="text-base font-bold text-gray-800 line-clamp-1">
                      {product.productName}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Product Details Row */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-600 items-center">
                      <div className="flex items-center gap-1">
                        <ShoppingBasket size={12} className="text-[#6dce00]" />
                        <span>{product.weight}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell size={12} className="text-[#6dce00]" />
                        <span>{product.proteinIntake}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-[#6dce00]" />
                        <span>{product.availableTime}</span>
                      </div>
                    </div>

                    {/* Available Days - Below protein row */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-600">
                      <CalendarDays size={12} className="text-[#6dce00] flex-shrink-0" />
                      <span className="font-medium">Available:</span>
                      <span>{formatAvailableDays(product.availableDay)}</span>
                    </div>

                    {/* Order Type Selection */}
                    <div className="flex gap-2 text-[11px] text-gray-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${product.id}-${index}`}
                          checked={(selectedType[index] || "singleOrder") === "singleOrder"}
                          onChange={() => handleTypeChange(index, "singleOrder")}
                          className="accent-[#6dce00]"
                        />
                        Single
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${product.id}-${index}`}
                          checked={selectedType[index] === "weeklySubscription"}
                          onChange={() => handleTypeChange(index, "weeklySubscription")}
                          className="accent-[#6dce00]"
                        />
                        Weekly
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${product.id}-${index}`}
                          checked={selectedType[index] === "monthlySubscription"}
                          onChange={() => handleTypeChange(index, "monthlySubscription")}
                          className="accent-[#6dce00]"
                        />
                        Monthly
                      </label>
                    </div>

                    {/* Price */}
                    <p className="text-sm font-semibold text-[#6dce00]">
                      ₹{getPrice(product, index)}{" "}
                      <span className="text-[11px] text-gray-500 font-normal">/ item</span>
                    </p>

                    {/* Quantity and Add to Cart */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrease(index)}
                          className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {quantities[index] || 1}
                        </span>
                        <button
                          onClick={() => handleIncrease(index)}
                          className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product, index)}
                        className="bg-[#6dce00] text-white text-xs py-2 px-3 rounded-full hover:bg-[#5abb00] transition-all flex items-center gap-1 shadow hover:shadow-md"
                      >
                        <ShoppingCart size={12} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More / Show Less Buttons */}
            {filteredProducts.length > 10 && (
              <div className="flex flex-col items-center mt-8 gap-3">
                <div className="flex gap-3">
                  {visibleCount < filteredProducts.length && (
                    <button
                      onClick={loadMoreProducts}
                      className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      Show More <ChevronDown size={16} />
                    </button>
                  )}
                  {visibleCount > 10 && (
                    <button
                      onClick={showLessProducts}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      Show Less <ChevronUp size={16} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
              <CalendarDays size={40} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                No Products Available
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                {selectedDate 
                  ? `No products available for ${getDayFromDate(selectedDate)}. Please select another date.`
                  : "No products found."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rest of your sections remain the same */}
      {/* Customized Diet Plan Section */}
      <div className="mt-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-lg">
        <div className="text-center mb-4">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
            Customized Diet Plan
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Need a personalized meal plan? Get a customized diet plan tailored to your health goals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            onClick={handleOpenGoogleForm}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <span>Get Customized Diet Plan</span>
            <ArrowRight size={16} />
          </button>
          <p className="text-xs text-gray-600">
            Contact us for personalized consultation
          </p>
        </div>
      </div>

      {/* Product Catalog PDF Section */}
      <div className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 shadow-lg">
        <div className="text-center mb-4">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
            Complete Product Catalog
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Explore our entire product range with all available products and subscription plans.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            onClick={() => setIsCatalogOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <FileText size={16} />
            <span>View Product Catalog</span>
          </button>
          <p className="text-xs text-gray-600">
            Explore our complete product offerings
          </p>
        </div>
      </div>

      {/* Catalog Popup Modal */}
      {isCatalogOpen && (
        <div onClick={() => setIsCatalogOpen(false)} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full relative">
            <img 
              src="/catelog.jpg" 
              alt="Product Catalog"
              className="w-full h-auto rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
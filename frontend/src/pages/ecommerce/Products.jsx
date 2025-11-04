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
} from "lucide-react";

const Products = () => {
  const [quantities, setQuantities] = useState({});
  const [selectedType, setSelectedType] = useState({});
  const [products, setProducts] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products`);
        const data = await res.json();
        setProducts(data || []);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [BASE_URL]);

  // Handle quantity change
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

  // Handle order type selection (Single / Weekly / Monthly)
  const handleTypeChange = (index, type) => {
    setSelectedType((prev) => ({
      ...prev,
      [index]: type,
    }));
  };

  // Get price based on selected type
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

  const cartItem = {
    ...product,
    _id: `${product.id || product.productName}-${Date.now()}`,
    quantity: qty,
    orderType,
    price, // 💡 store correct price based on selected type
  };

  existing.push(cartItem);
  sessionStorage.setItem("cartItems", JSON.stringify(existing));
  window.dispatchEvent(new Event("cartUpdated"));

  Swal.fire({
    title: "Added to Cart!",
    text: `${product.productName} (${orderType.replace("Subscription", "")}) x${qty} added to your cart.`,
    icon: "success",
    confirmButtonColor: "#6dce00",
    confirmButtonText: "OK",
  });
};


  return (
    <section
      id="products"
      className="min-h-screen px-6 md:px-16 py-16 text-gray-800 overflow-hidden relative"
    >
      <div className="text-start mb-12">
        <span className="text-2xl dancing-script text-orange-600 font-semibold">
          Our Products
        </span>
        <h2 className="text-4xl font-extrabold text-[#6dce00]/80 ubuntu mt-2">
          Wholesome. Organic. Fresh.
        </h2>
        <p className="text-sm text-gray-600 mt-3">
          Explore our curated range of organic food products grown with care,
          packed with love.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {products.map((product, index) => (
          <motion.div
            key={index}
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
                  <span>{product.availableDay}</span>
                </div>
              </div>

              {/* Radio Buttons */}
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

              {/* Dynamic Price Display */}
              <p className="text-sm font-semibold text-[#6dce00] mt-1">
                ₹{getPrice(product, index)}{" "}
                <span className="text-xs text-gray-500">/ item</span>
              </p>

              {/* Quantity and Add to Cart */}
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
    </section>
  );
};

export default Products;

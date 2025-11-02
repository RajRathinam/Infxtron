import React, { useState } from "react";
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

  const handleAddToCart = (product, index) => {
    const qty = quantities[index] || 1;
    const existing = JSON.parse(sessionStorage.getItem("cartItems")) || [];

    const itemIndex = existing.findIndex(
      (item) => item.productName === product.productName
    );

    if (itemIndex > -1) {
      existing[itemIndex].quantity += qty;
    } else {
      existing.push({ ...product, quantity: qty });
    }

    sessionStorage.setItem("cartItems", JSON.stringify(existing));

    // ✅ Update header cart count
    window.dispatchEvent(new Event("cartUpdated"));

    // 🎉 Sweet Alert Popup
    Swal.fire({
      title: "Added to Cart!",
      text: `${product.productName} (x${qty}) has been added to your cart.`,
      icon: "success",
      confirmButtonColor: "#6dce00",
      confirmButtonText: "OK",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  };

  const products = [
    {
      productName: "Organic Veggie Pack",
      packName: "Farm Fresh Combo",
      weight: "1kg",
      proteinIntake: "10g",
      availableDay: "Everyday",
      availableTime: "8 AM - 6 PM",
      singleOrder: 199,
      weeklySubscription: 999,
      monthlySubscription: 3499,
      imagePath: "/assets/21.png",
      description:
        "A wholesome mix of hand-picked organic vegetables grown naturally.",
    },
    {
      productName: "Fresh Fruit Basket",
      packName: "Tropical Delight",
      weight: "1.5kg",
      proteinIntake: "8g",
      availableDay: "Monday - Saturday",
      availableTime: "9 AM - 5 PM",
      singleOrder: 249,
      weeklySubscription: 1199,
      monthlySubscription: 4299,
      imagePath: "/assets/22.png",
      description:
        "Bursting with natural sweetness, perfect for a healthy energy boost.",
    },
    {
      productName: "Protein Salad Bowl",
      packName: "Fit & Fresh",
      weight: "500g",
      proteinIntake: "25g",
      availableDay: "Everyday",
      availableTime: "10 AM - 8 PM",
      singleOrder: 149,
      weeklySubscription: 799,
      monthlySubscription: 2799,
      imagePath: "/assets/21.png",
      description: "A nutrient-packed salad rich in protein and flavor.",
    },
    {
      productName: "Organic Juice Pack",
      packName: "Nature’s Sip",
      weight: "1L",
      proteinIntake: "5g",
      availableDay: "Everyday",
      availableTime: "9 AM - 7 PM",
      singleOrder: 129,
      weeklySubscription: 699,
      monthlySubscription: 2399,
      imagePath: "/assets/22.png",
      description:
        "Cold-pressed and 100% natural — refresh yourself with pure energy.",
    },
  ];

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

            <div className="p-5 flex flex-col space-y-2">
              <h3 className="text-lg font-bold text-gray-800">
                {product.productName}
              </h3>
              <p className="text-xs text-gray-500">{product.description}</p>

              <div className="flex flex-wrap gap-4 text-[12px] text-gray-600 mt-3 items-center">
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

              <div className="mt-3">
                <p className="text-sm font-semibold text-[#6dce00]">
                  ₹{product.singleOrder} / item
                </p>
                <p className="text-xs text-gray-500">
                  Weekly: ₹{product.weeklySubscription} | Monthly: ₹
                  {product.monthlySubscription}
                </p>
              </div>

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

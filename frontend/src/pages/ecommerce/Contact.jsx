import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import Swal from "sweetalert2";
import { customersAPI } from "../../utils/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    wantsOffers: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      wantsOffers: value,
      email: value ? prev.email : "", // clear email when false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone) {
      Swal.fire({
        title: "Missing Information!",
        text: "Please fill in your name and phone number.",
        icon: "warning",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      Swal.fire({
        title: "Invalid Phone!",
        text: "Phone number must be exactly 10 digits.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    if (formData.wantsOffers && !formData.email) {
      Swal.fire({
        title: "Email Required!",
        text: "Email is required if you want to receive offers.",
        icon: "warning",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    setLoading(true);

    try {
      await customersAPI.submitContact(formData);
      
      Swal.fire({
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you soon!",
        icon: "success",
        confirmButtonColor: "#6dce00",
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
        wantsOffers: false,
      });
    } catch (error) {
      console.error("Contact form error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to send message. Please try again.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="min-h-screen px-6 md:px-16 py-16 bg-gray-50 flex flex-col items-center justify-center"
    >
      <div className="text-start mb-10">
        <span className="text-2xl dancing-script text-orange-600 font-semibold">
          Contact Us
        </span>
        <h2 className="text-4xl font-extrabold text-[#6dce00]/80 ubuntu mt-2">
          We’d love to hear from you!
        </h2>
        <p className="text-sm text-gray-600 mt-3">
          Fill out the form below — we’ll get back to you soon.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-xl shadow-lg md:p-8 p-4 py-8 space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#6dce00] focus:outline-none text-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            required
            pattern="\d{10}"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#6dce00] focus:outline-none text-sm"
          />
        </div>

        {/* Want Offers Radio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Would you like to receive offers?
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="offers"
                checked={formData.wantsOffers === true}
                onChange={() => handleRadioChange(true)}
                className="accent-[#6dce00]"
              />
              <span className="text-sm text-gray-700">Yes, I want offers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="offers"
                checked={formData.wantsOffers === false}
                onChange={() => handleRadioChange(false)}
                className="accent-[#6dce00]"
              />
              <span className="text-sm text-gray-700">No, thanks</span>
            </label>
          </div>
        </div>

        {/* Email (Animated Show/Hide) */}
        <AnimatePresence>
          {formData.wantsOffers && (
            <motion.div
              key="email-field"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Email Address (required for offers)
              </label>
              <input
                type="email"
                name="email"
                required={formData.wantsOffers}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#6dce00] focus:outline-none text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message here..."
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#6dce00] focus:outline-none text-sm h-28 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#6dce00]/80 text-white py-2.5 rounded-lg hover:bg-[#5abb00] transition-all flex items-center justify-center gap-2 text-sm font-semibold ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <Send size={16} />
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
};

export default Contact;

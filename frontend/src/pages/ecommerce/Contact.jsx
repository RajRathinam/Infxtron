import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios"; // <--- Import axios
import axiosInstance from "../../utils/axiosConfig";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    wantsOffers: false,
  });

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
      email: value ? prev.email : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/api/customers", formData);

      Swal.fire({
        title: "Message Sent!",
        text: response.data.message || "Thank you for contacting us. We'll get back to you soon.",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "OK",
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
      console.error("Error submitting form:", error);

      Swal.fire({
        title: "Oops!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "OK",
      });
    }
  };

  const contactInfo = [
    { icon: Phone, title: "Phone", content: "+91 9943311192", link: "tel:+919943311192", color: "from-emerald-500 to-teal-500" },
    { icon: Mail, title: "Email", content: "agshealthyfood@gmail.com", link: "mailto:support@agshealthyfood@gmail.com", color: "from-teal-500 to-cyan-500" },
    { icon: MapPin, title: "Address", content: "Nagapattinam, Tamil Nadu, India", link: "#", color: "from-green-500 to-emerald-500" },
    { icon: Clock, title: "Business Hours", content: "Mon - Sat: 7:00 AM - 8:00 PM", link: "#", color: "from-emerald-500 to-green-500" },
  ];

  return (
    <section id="contact" className="min-h-screen py-12 md:py-20 px-4 sm:px-6 md:px-16 bg-gradient-to-b from-white via-emerald-50/30 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-sm md:text-base font-semibold text-amber-600 mb-4">
            <MessageCircle size={16} className="text-amber-600" />
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 ubuntu">
            We'd Love to{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Hear from You
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or feedback? Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Side - Contact Info Cards */}
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a key={index} href={info.link} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-br ${info.color} rounded-2xl p-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-sm md:text-base text-gray-600">{info.content}</p>
                    </div>
                  </div>
                </motion.a>
              );
            })}

            {/* Quick Response Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 rounded-xl p-3">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">Quick Response</h3>
              </div>
              <p className="text-sm md:text-base opacity-90 leading-relaxed">
                We typically respond within 24 hours. For urgent matters, please call us directly.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 space-y-6 border border-gray-100">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-base transition-all duration-300 bg-gray-50 hover:bg-white" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input type="tel" name="phone" required pattern="\d{10}" value={formData.phone} onChange={handleChange} placeholder="Enter 10-digit phone number" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-base transition-all duration-300 bg-gray-50 hover:bg-white" />
              </div>

              {/* Offers Radio */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Would you like to receive special offers?
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="radio" name="offers" checked={formData.wantsOffers === true} onChange={() => handleRadioChange(true)} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${formData.wantsOffers === true ? "border-emerald-600 bg-emerald-600" : "border-gray-300 group-hover:border-emerald-400"}`}>
                        {formData.wantsOffers === true && <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>}
                      </div>
                    </div>
                    <span className="text-sm md:text-base text-gray-700 font-medium">Yes, I want offers</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="radio" name="offers" checked={formData.wantsOffers === false} onChange={() => handleRadioChange(false)} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${formData.wantsOffers === false ? "border-emerald-600 bg-emerald-600" : "border-gray-300 group-hover:border-emerald-400"}`}>
                        {formData.wantsOffers === false && <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>}
                      </div>
                    </div>
                    <span className="text-sm md:text-base text-gray-700 font-medium">No, thanks</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <AnimatePresence>
                {formData.wantsOffers && (
                  <motion.div key="email-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                      <span className="text-xs font-normal text-gray-500 ml-2">(required for offers)</span>
                    </label>
                    <input type="email" name="email" required={formData.wantsOffers} value={formData.email} onChange={handleChange} placeholder="Enter your email address" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-base transition-all duration-300 bg-gray-50 hover:bg-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Message
                </label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write your message here..." rows={5} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-base resize-none transition-all duration-300 bg-gray-50 hover:bg-white" />
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]">
                <Send size={20} />
                <span>Send Message</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

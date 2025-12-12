import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle, Loader2, Sparkles, Shield, Zap, User, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    wantsOffers: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    if (formData.wantsOffers && !formData.email) {
      Swal.fire({
        title: "Email Required",
        text: "Please enter your email to receive offers.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "OK",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/api/customers", formData);

      Swal.fire({
        title: "✅ Message Sent!",
        text: response.data.message || "Thank you for contacting us. We'll get back to you within 24 hours.",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Great!",
        timer: 3000,
        timerProgressBar: true,
      });

      // Reset form with success state
      setIsSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
        wantsOffers: false,
      });

      // Reset success state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);

      Swal.fire({
        title: "❌ Oops!",
        text: error.response?.data?.message || "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Business owner information
  const businessInfo = {
    owner: "MARY JAGATHA BANU X",
    title: "Owner of Business",
    fssaiNumber: "22425437000429",
    address: "No.40 A Mahalakshmi Nagar, South Palpannaichery",
    city: "Nagapattinam, Tamil Nadu",
    pincode: "611001",
    googleMaps: "https://www.google.com/maps/place/10%C2%B047'35.8%22N+79%C2%B050'34.9%22E/@10.7932819,79.8404637,17z/data=!3m1!4b1!4m4!3m3!8m2!3d10.7932819!4d79.8430386?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D"
  };

  const contactInfo = [
    { 
      icon: Phone, 
      title: "Call Us", 
      content: "+91 9943311192", 
      subtitle: "Available 7AM-8PM",
      link: "tel:+919943311192", 
      color: "from-emerald-500 to-teal-500",
      accentColor: "bg-emerald-500"
    },
    { 
      icon: Mail, 
      title: "Email Us", 
      content: "agshealthyfoods@gmail.com", 
      subtitle: "Response within 24 hours",
      link: "mailto:agshealthyfoods@gmail.com", 
      color: "from-blue-500 to-cyan-500",
      accentColor: "bg-blue-500"
    },
    { 
      icon: MapPin, 
      title: "Visit Us", 
      content: businessInfo.address, 
      subtitle: `${businessInfo.city}, ${businessInfo.pincode}`,
      link: businessInfo.googleMaps, 
      color: "from-green-500 to-emerald-500",
      accentColor: "bg-green-500"
    },
    { 
      icon: Clock, 
      title: "Business Hours", 
      content: "Mon - Sat", 
      subtitle: "7:00 AM - 8:00 PM",
      link: "#", 
      color: "from-amber-500 to-orange-500",
      accentColor: "bg-amber-500"
    },
  ];

  return (
    <section 
      id="contact" 
      className="relative py-12 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-white via-emerald-50/20 to-white overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-10 left-5 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-5 w-48 h-48 bg-teal-100/40 rounded-full blur-3xl"></div>
      
      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-20 right-10 hidden md:block"
      >
        <MessageCircle size={24} className="text-emerald-300" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute bottom-32 left-8 hidden md:block"
      >
        <Send size={20} className="text-teal-300" />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-100 shadow-sm mb-4"
          >
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Let's Connect
            </span>
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Have Questions?{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                We're Here
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              ></motion.div>
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed"
          >
            Reach out to us for inquiries, feedback, or to place your first organic food order. 
            We're ready to serve you!
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Side - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={index}
                  href={info.link}
                  target={info.link.includes('http') ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -3 }}
                  className="block group"
                >
                  <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200 relative overflow-hidden">
                    
                    {/* Corner accent */}
                    <div className={`absolute top-0 right-0 w-0 h-0 border-l-[25px] border-l-transparent border-t-[25px] ${info.accentColor.replace('bg-', 'border-t-')} opacity-20`}></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`flex-shrink-0 bg-gradient-to-br ${info.color} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{info.title}</h3>
                        <p className="text-xs text-gray-800 font-medium mb-1">{info.content}</p>
                        <p className="text-xs text-gray-500">{info.subtitle}</p>
                      </div>
                    </div>
                    
                    {/* Hover line */}
                    <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full ${info.accentColor} transition-all duration-300`}></div>
                  </div>
                </motion.a>
              );
            })}

            {/* Business Owner Card - Simplified */}
<motion.div
  initial={{ opacity: 0, y: 15 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, delay: 0.3 }}
  className="relative bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
>
  {/* Decorative corner accent */}
  <div className="absolute top-0 right-0 w-24 h-24">
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-200/30 to-indigo-200/20 rounded-full blur-xl"></div>
    <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full"></div>
  </div>

  {/* Floating decorative element */}
  <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full opacity-50"></div>
  <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-purple-300/10 to-indigo-300/10 rounded-full"></div>

  {/* Bottom-left accent */}
  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-purple-100/40 to-indigo-100/30 rounded-full"></div>

  {/* Main content container */}
  <div className="relative z-10">
    <div className="flex flex-col items-center gap-4">
      {/* Icon container with glow effect */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="relative bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-4 shadow-lg">
          <User size={24} className="text-white" />
        </div>
      </div>

      {/* Content section */}
      <div className="text-center space-y-3">
        {/* Title with decorative underline */}
        <div className="relative inline-block">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Business Owner</h3>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full"></div>
        </div>

        {/* Owner name with gradient text */}
        <div className="relative">
          <p className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold tracking-tight">
            {businessInfo.owner}
          </p>
        </div>

        {/* Title with subtle styling */}
        <p className="text-sm text-gray-600 font-medium px-4 py-1 bg-white/50 rounded-full inline-block">
          {businessInfo.title}
        </p>

        {/* FSSAI section with enhanced styling */}
        <div className="mt-6 pt-6 border-t border-purple-200/60">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Icon badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 rounded-lg">
                <div className="p-1.5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                  <ShieldCheck size={18} className="text-purple-600" />
                </div>
                <p className="text-xs font-bold text-gray-900">FSSAI Registration</p>
              </div>
              
              {/* Number with copy indication */}
              <div className="relative">
                <p className="text-sm font-mono font-semibold text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  {businessInfo.fssaiNumber}
                </p>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Verification badge */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-purple-200 shadow-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-700">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Hover effect overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/5 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl pointer-events-none"></div>

  {/* Corner badge for additional visual interest */}
  <div className="absolute top-3 left-3">
    <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full animate-pulse"></div>
  </div>
</motion.div>

            {/* Quick Response Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="relative group"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg overflow-hidden">
                
                {/* Pattern overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 rounded-lg p-2.5">
                      <Zap size={18} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Quick Response</h3>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed mb-3">
                    We typically respond within <strong>24 hours</strong>. For urgent matters, 
                    please call us directly.
                  </p>
                  <div className="flex items-center gap-2 text-xs opacity-80">
                    <CheckCircle size={12} />
                    <span>Priority Support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500/95 to-teal-500/95 rounded-xl z-20 flex flex-col items-center justify-center p-8 text-center text-white"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                  <p className="text-sm opacity-90">
                    Thank you for contacting AG's Healthy Food. We'll get back to you soon.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100 relative ${isSubmitted ? 'blur-sm' : ''}`}>
              
              {/* Form header */}
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Send us a Message</h3>
                <p className="text-xs text-gray-600">
                  Fill out the form below and we'll respond promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm transition-all duration-300 bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="\d{10}"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit phone number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm transition-all duration-300 bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Offers Radio */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-800">
                    Would you like to receive special offers?
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="offers"
                          checked={formData.wantsOffers === true}
                          onChange={() => handleRadioChange(true)}
                          className="sr-only"
                          disabled={isSubmitting}
                        />
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${formData.wantsOffers === true ? "border-emerald-600 bg-emerald-600" : "border-gray-300 group-hover:border-emerald-400"} ${isSubmitting ? "opacity-50" : ""}`}>
                          {formData.wantsOffers === true && (
                            <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium text-gray-700 ${isSubmitting ? "opacity-50" : ""}`}>
                        Yes, send me offers
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="offers"
                          checked={formData.wantsOffers === false}
                          onChange={() => handleRadioChange(false)}
                          className="sr-only"
                          disabled={isSubmitting}
                        />
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${formData.wantsOffers === false ? "border-emerald-600 bg-emerald-600" : "border-gray-300 group-hover:border-emerald-400"} ${isSubmitting ? "opacity-50" : ""}`}>
                          {formData.wantsOffers === false && (
                            <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium text-gray-700 ${isSubmitting ? "opacity-50" : ""}`}>
                        No, thanks
                      </span>
                    </label>
                  </div>
                </div>

                {/* Email - Conditional */}
                <AnimatePresence>
                  {formData.wantsOffers && (
                    <motion.div
                      key="email-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-gray-800 mb-2">
                        Email Address <span className="text-red-500">*</span>
                        <span className="text-xs font-normal text-gray-500 ml-1">(for offers)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required={formData.wantsOffers}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm transition-all duration-300 bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-2">
                    Message <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you're looking for or ask any questions..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm resize-none transition-all duration-300 bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded relative overflow-hidden group ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300"></div>
                  
                  {/* Button shine effect */}
                  <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <div className="relative py-3.5 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Form footer */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to our{" "}
                  <Link to={"/privacy"} className="text-emerald-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-gray-500">
            We're committed to providing the best organic food experience. 
            Your satisfaction is our priority.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
import React, { useState, useEffect } from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  Shield,
  FileText,
  Home,
  ShoppingBag,
  Users,
  PhoneCall,
  ShoppingCart,
  Truck,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  // Handle link click
  const handleLinkClick = (link) => {
    if (link.href === "/cart") {
      navigate("/cart");
    } else {
      handleScroll(link.href);
    }
  };

  // Smooth scroll to a section (even when navigating from another page)
  const handleScroll = (id) => {
    if (window.location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const quickLinks = [
    { name: "Home", href: "home", icon: Home },
    { name: "Products", href: "products", icon: ShoppingBag },
    { name: "Cart", href: "/cart", icon: ShoppingCart },
    { name: "About Us", href: "about", icon: Users },
    { name: "Contact", href: "contact", icon: PhoneCall },
  ];

  const policyLinks = [
    { 
      name: "Privacy", 
      icon: Shield, 
      path: "/privacy"
    },
    { 
      name: "Terms", 
      icon: FileText, 
      path: "/terms" 
    },
    { 
      name: "Shipping", 
      icon: Truck, 
      path: "/shipping" 
    },
    { 
      name: "Refunds", 
      icon: RotateCcw, 
      path: "/refunds" 
    },
    { 
      name: "Return", 
      icon: RefreshCw, 
      path: "/return" 
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/ags_healthy_food/?igsh=MW1qNzBlZjltNGQwdQ%3D%3D#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 text-gray-800 pt-16 pb-4 px-4 sm:px-6 md:px-16 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-12">
          {/* Brand Section - Takes 5 columns on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/AGHealthyFood.png"
                alt="AG's Healthy Food"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6 max-w-lg">
              Promoting health and freshness through organic meals and pure natural ingredients —
              made with care for your well-being. Bringing nature's best to your table.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile Layout */}
          <div className="flex md:hidden justify-between gap-8">
            {/* Quick Links for Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
            >
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag size={20} />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <li key={index}>
                      {link.href === "/cart" ? (
                        <Link
                          to="/cart"
                          className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                        >
                          <Icon size={16} className="text-emerald-600" />
                          {link.name}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                        >
                          <Icon size={16} className="text-emerald-600" />
                          {link.name}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Policies for Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield size={20} />
                Policies
              </h4>
              <ul className="space-y-3">
                {policyLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <li key={index}>
                      <Link
                        to={link.path}
                        className="text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                      >
                        <Icon size={16} className="text-emerald-600" />
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>

          {/* Desktop Layout - Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 hidden md:block"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag size={20} />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    {link.href === "/cart" ? (
                      <Link
                        to="/cart"
                        className="text-sm md:text-base text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                      >
                        <Icon size={16} className="text-emerald-600" />
                        {link.name}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="text-sm md:text-base text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                      >
                        <Icon size={16} className="text-emerald-600" />
                        {link.name}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Desktop Layout - Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 hidden md:block"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} />
              Policies
            </h4>
            <ul className="space-y-3">
              {policyLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-sm md:text-base text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group w-full text-left"
                    >
                      <Icon size={16} className="text-emerald-600" />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PhoneCall size={20} />
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <a href="tel:+919943311192" className="text-sm md:text-base text-gray-700 hover:text-emerald-600 transition-colors">
                    +91 9943311192
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Mail size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a href="mailto:agshealthyfoods@gmail.com" className="text-sm md:text-base text-gray-700 hover:text-emerald-600 transition-colors break-all">
                    agshealthyfoods@gmail.com
                  </a>
                </div>
              </li>
<li className="flex items-start gap-3">
  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
    <MapPin size={18} className="text-emerald-600" />
  </div>
  <div>
    <p className="text-xs text-gray-500 mb-1">Location</p>
    <a 
      href="https://www.google.com/maps/place/10%C2%B047'35.8%22N+79%C2%B050'34.9%22E/@10.7932819,79.8404637,17z/data=!3m1!4b1!4m4!3m3!8m2!3d10.7932819!4d79.8430386?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm md:text-base text-gray-700 hover:text-emerald-600 transition-colors break-all"
    >
      Nagapattinam, Tamil Nadu, India
    </a>
  </div>
</li>
            </ul>
          </motion.div>
        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                AG's Healthy Food
              </span>
              . All rights reserved.
            </p>
            <p className="text-sm text-gray-500 text-center md:text-left">
              Powered by{" "}
              <a
                href="https://www.infygrid.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                Infygrid Solutions
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from "react";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Products", href: "#products" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 text-gray-800 pt-16 pb-8 px-4 sm:px-6 md:px-16 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/AGHealthyFood.png"
                alt="AG's Healthy Food"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6 max-w-md">
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

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold text-gray-900 mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm md:text-base text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold text-gray-900 mb-6">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <a href="tel:+919876543210" className="text-sm md:text-base text-gray-700 hover:text-emerald-600 transition-colors">
                    +91 9943311192
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Mail size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a href="mailto:support@agshealthyfood.com" className="text-sm md:text-base text-gray-700 hover:text-emerald-600 transition-colors break-all">
                    agshealthyfood@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm md:text-base text-gray-700">
                    Nagapattinam, Tamil Nadu, India
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8 mt-8">
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
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

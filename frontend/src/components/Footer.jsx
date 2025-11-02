import React from "react";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className=" bg-gradient-to-b from-green-50 to-white  text-gray-700 pt-14 pb-6 px-8 md:px-16 relative overflow-hidden">
      {/* Decorative overlay */}
      <img
        src="/assets/bg-pattern.png"
        alt="pattern"
        className="absolute top-0 right-0 w-[400px] opacity-10 pointer-events-none"
      />

      <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
        {/* Brand Section */}
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/AGHealthyFood.png"
              alt="AG’s Healthy Food"
              className="w-40 h-auto object-contain"
            />
          </div>

          <p className="text-xs text-justify text-gray-600 leading-relaxed">
            Promoting health and freshness through organic meals and pure natural
            ingredients — made with care for your well-being.
          </p>

          <div className="flex gap-4 mt-5">
            <a
              href="#"
              className="p-2 bg-[#6dce00]/10 rounded-full hover:bg-[#6dce00]/20 transition"
            >
              <Facebook className="text-[#6dce00]" size={18} />
            </a>
            <a
              href="#"
              className="p-2 bg-[#6dce00]/10 rounded-full hover:bg-[#6dce00]/20 transition"
            >
              <Instagram className="text-[#6dce00]" size={18} />
            </a>
            <a
              href="mailto:info@agshealthyfood.com"
              className="p-2 bg-[#6dce00]/10 rounded-full hover:bg-[#6dce00]/20 transition"
            >
              <Mail className="text-[#6dce00]" size={18} />
            </a>
          </div>
        </div>

        {/* Links + Contact Section */}
        <div className="flex-1 flex flex-row justify-between">
          {/* Quick Links */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <a
                  href="#home"
                  className="hover:text-[#6dce00] transition duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className="hover:text-[#6dce00] transition duration-200"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-[#6dce00] transition duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-[#6dce00] transition duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#6dce00]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#6dce00]" />
                <span>support@agshealthyfood.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-[#6dce00]" />
                <span>Nagapattinam, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-200 mt-10 pt-4 text-center text-sm text-gray-500 relative z-10">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#6dce00] font-semibold">AG’s Healthy Food</span>.
        All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

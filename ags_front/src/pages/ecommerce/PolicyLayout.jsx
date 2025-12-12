import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  Shield, 
  FileText, 
  Truck, 
  RotateCcw, 
  RefreshCw,
  ArrowLeft
} from "lucide-react";

const PolicyLayout = ({ children, title, subtitle, icon: Icon, gradientFrom, gradientTo }) => {
  const location = useLocation();
  
  // Scroll to top when the component mounts or when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-medium">Back to Home</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Icon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {title}
              </h1>
              <p className="text-white/90 text-sm max-w-3xl">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 md:p-8"
        >
          {children}
        </motion.div>
      </div>

      {/* Footer Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyLayout;
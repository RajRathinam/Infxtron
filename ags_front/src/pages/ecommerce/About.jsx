import React from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, Users, Award, Heart, CheckCircle, 
  Sparkles, Star, Target, Truck, Shield,
  Sprout, Sun, Droplets, ChevronRight
} from 'lucide-react';

const About = () => {
  const features = [
    { 
      icon: Leaf, 
      title: "100% Organic", 
      description: "Certified organic produce from trusted farmers",
      gradient: "from-emerald-400 to-green-500",
      color: "emerald",
      accentPosition: "top-right"
    },
    { 
      icon: Users, 
      title: "Community Driven", 
      description: "Supporting local farmers and sustainable practices",
      gradient: "from-blue-400 to-cyan-500",
      color: "blue",
      accentPosition: "top-left"
    },
    { 
      icon: Award, 
      title: "Premium Quality", 
      description: "Carefully selected and tested for freshness",
      gradient: "from-amber-400 to-orange-500",
      color: "amber",
      accentPosition: "bottom-right"
    },
    { 
      icon: Heart, 
      title: "Made with Love", 
      description: "Every meal prepared with care and dedication",
      gradient: "from-rose-400 to-pink-500",
      color: "rose",
      accentPosition: "bottom-left"
    }
  ];

  const values = [
    "Farm-to-table freshness guaranteed",
    "Eco-friendly and sustainable practices",
    "Daily delivery of fresh products",
    "100% satisfaction guarantee",
    "Supporting local farming communities",
    "Chemical-free & pesticide-free",
    "Seasonal produce only",
    "Zero plastic packaging"
  ];

  const stats = [
    { 
      number: "50+", 
      label: "Organic Products", 
      icon: Leaf,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-600"
    },
    { 
      number: "100%", 
      label: "Natural Ingredients", 
      icon: Heart,
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-600"
    },
    { 
      number: "50+", 
      label: "Happy Customers", 
      icon: Users,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600"
    },
    { 
      number: "6 days", 
      label: "Door Delivery", 
      icon: Truck,
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      textColor: "text-cyan-600"
    }
  ];

  return (
    <section
      id="about"
      className="relative py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-emerald-50/10 to-teal-50/10 overflow-hidden"
    >
      {/* Subtle Background Decorations */}
      <div className="absolute top-20 left-5 w-40 h-40 bg-emerald-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-5 w-48 h-48 bg-teal-100/30 rounded-full blur-3xl"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 right-10 opacity-10">
        <Leaf size={40} className="text-emerald-400" />
      </div>
      <div className="absolute bottom-1/3 left-5 opacity-10">
        <Sprout size={32} className="text-green-400" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 px-2"
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
              Our Organic Promise
            </span>
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Pure Food,{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Pure Life
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
            className="text-xs md:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            At <strong className="text-emerald-600 font-semibold">AG's Healthy Food</strong>, 
            we connect you with nature's finest produce, cultivated with care and delivered with commitment.
          </motion.p>
        </motion.div>

        {/* Stats Grid - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 mb-12 md:mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="relative group"
              >
                {/* Card with corner accent */}
                <div className={`relative ${stat.bgColor} rounded-xl border ${stat.borderColor} p-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}>
                  
                  {/* Corner accent - small subtle triangle */}
                  <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${stat.borderColor.replace('border-', 'border-t-')} opacity-50`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor.replace('50', '100')} border ${stat.borderColor}`}>
                        <Icon size={18} className={stat.textColor} />
                      </div>
                      <ChevronRight size={14} className={`${stat.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.number}</div>
                      <div className="text-xs font-medium text-gray-700 leading-tight">{stat.label}</div>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 ${stat.bgColor.replace('50', '100')} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900"
              >
                From Our{" "}
                <span className="text-emerald-600">Soil</span>{" "}
                to Your{" "}
                <span className="text-amber-600">Table</span>
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs md:text-sm text-gray-600 leading-relaxed"
              >
                Every product we offer is grown organically, ensuring maximum freshness and sustainability. 
                We partner with local farmers who share our vision for a healthier, greener future.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xs md:text-sm text-gray-600 leading-relaxed"
              >
                Our commitment extends beyond food—we're building a community that values transparency, 
                quality, and the stories behind every harvest.
              </motion.p>
            </div>

            {/* Values List - Compact Design */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {values.slice(0, 6).map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-white border border-gray-100 hover:border-emerald-100 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle size={14} className="text-emerald-500" />
                  </div>
                  <span className="text-xs text-gray-700">{value}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Image with Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative group">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/assets/8.png"
                  alt="Fresh Organic Produce"
                  className="w-full h-64 sm:h-80 md:h-96 object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Floating Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Star size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">Premium Quality</div>
                      <div className="text-xs text-gray-600">Since 2024</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Top Right Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute top-4 right-4"
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-xs font-semibold">100% Organic</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Floating Element - Bottom Right */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Leaf size={20} className="text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid - Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Our Core Values
            </h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Built on principles that matter
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              // Determine corner accent position
              const accentClasses = {
                'top-right': 'top-0 right-0 border-l-[30px] border-l-transparent border-t-[30px]',
                'top-left': 'top-0 left-0 border-r-[30px] border-r-transparent border-t-[30px]',
                'bottom-right': 'bottom-0 right-0 border-l-[30px] border-l-transparent border-b-[30px]',
                'bottom-left': 'bottom-0 left-0 border-r-[30px] border-r-transparent border-b-[30px]'
              };
              
              const borderColor = `border-${feature.color}-200`;
              const accentColor = `border-t-${feature.color}-200`;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative group"
                >
                  {/* Main Card */}
                  <div className={`relative bg-white rounded-xl border ${borderColor} p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
                    
                    {/* Corner accent triangle */}
                    <div className={`absolute ${accentClasses[feature.accentPosition]} ${accentColor} opacity-50`}></div>
                    
                    {/* Floating icon background */}
                    <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-full`}></div>
                    
                    <div className="relative z-10">
                      {/* Icon with gradient */}
                      <div className={`mb-4 inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-md`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      
                      {/* Title and description */}
                      <h4 className="text-base font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {/* Bottom line indicator */}
                      <div className={`mt-4 h-0.5 w-12 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Simple CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-emerald-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
              Ready to Taste Real Food?
            </h3>
            <p className="text-xs text-gray-600 mb-6 max-w-md mx-auto">
              Join hundreds of families enjoying healthier, fresher meals every day.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              Start Your Journey Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Users, Award, Heart, CheckCircle } from 'lucide-react';

const About = () => {
  const features = [
    { icon: Leaf, title: "100% Organic", description: "Certified organic produce from trusted farmers" },
    { icon: Users, title: "Community Driven", description: "Supporting local farmers and sustainable practices" },
    { icon: Award, title: "Premium Quality", description: "Carefully selected and tested for freshness" },
    { icon: Heart, title: "Made with Love", description: "Every meal prepared with care and dedication" }
  ];

  const values = [
    "Farm-to-table freshness guaranteed",
    "Eco-friendly and sustainable practices",
    "Daily delivery of fresh products",
    "100% satisfaction guarantee"
  ];

  return (
    <section
      id="about"
      className="min-h-screen relative py-12 md:py-20 px-4 sm:px-6 md:px-16 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-sm md:text-base font-semibold text-amber-600 mb-4">
            <Leaf size={16} className="text-amber-600" />
            Our Story
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 ubuntu">
            We Believe in{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Real, Wholesome Food
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            At <strong className="text-emerald-600">AG's Healthy Food</strong>, our mission is to bring nature's purest produce directly to your plate.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Nourishing Your Health, One Meal at a Time
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Every fruit, vegetable, and product we offer is grown organically, ensuring freshness and sustainability. 
                We work closely with local farmers and eco-conscious producers who share our vision for a greener future.
              </p>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Because when food is grown with love and care — you can taste the difference. Our commitment to quality 
                means you get the best nature has to offer, delivered fresh to your doorstep.
              </p>
            </div>

            {/* Values List */}
            <div className="mt-6 space-y-3">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-sm md:text-base text-gray-700">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Green Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 rounded-3xl blur-xl opacity-30"></div>
              
              <img
                src="/assets/8.png"
                alt="About Healthy Food"
                className="relative w-full h-[400px] md:h-[500px] object-cover rounded-3xl"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-3xl"></div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={28} className="text-emerald-600" />
                </div>
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm md:text-base text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-20 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl md:text-5xl font-black mb-2">10+</div>
              <div className="text-sm md:text-base opacity-90">Products</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-black mb-2">100%</div>
              <div className="text-sm md:text-base opacity-90">Organic</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-black mb-2">40+</div>
              <div className="text-sm md:text-base opacity-90">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-black mb-2">🚚</div>
              <div className="text-sm md:text-base opacity-90">Free Delivery</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;

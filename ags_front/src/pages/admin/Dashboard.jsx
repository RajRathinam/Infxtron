import React, { useEffect, useState } from "react";
import { Users, Package, ShoppingBag, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosConfig";

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: "Total Customers", value: 0, icon: <Users size={32} className="text-green-600" />, bg: "bg-gradient-to-br from-green-50 to-emerald-50", color: "text-green-700", accent: "from-green-500/20 to-emerald-500/10" },
    { title: "Total Orders", value: 0, icon: <ShoppingBag size={32} className="text-orange-600" />, bg: "bg-gradient-to-br from-orange-50 to-amber-50", color: "text-orange-700", accent: "from-orange-500/20 to-amber-500/10" },
    { title: "Total Products", value: 0, icon: <Package size={32} className="text-blue-600" />, bg: "bg-gradient-to-br from-blue-50 to-cyan-50", color: "text-blue-700", accent: "from-blue-500/20 to-cyan-500/10" },
  ]);

  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch dashboard stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosInstance.get("/api/admin/dashboard-stats", {
        method: "GET",
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        const data = res.data;
        setStats([
          { ...stats[0], value: data.totalCustomers || 0 },
          { ...stats[1], value: data.totalOrders || 0 },
          { ...stats[2], value: data.totalProducts || 0 },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back, Admin!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your business today</p>
      </div>

      {/* Stats Cards with Decorative Backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-2xl shadow-lg"
          >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 z-0">
              {/* Main gradient background */}
              <div className={`absolute inset-0 ${stat.bg}`}></div>
              
              {/* Decorative circles */}
              <div className="absolute -top-15 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
              
              {/* Accent gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-10`}></div>
              
              {/* Pattern dots */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-current"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full border border-current"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${stat.color} opacity-80`}>{stat.title}</p>
                  {loadingStats ? (
                    <div className="mt-3">
                      <div className="h-8 w-20 bg-gray-200/50 animate-pulse rounded-lg"></div>
                      <div className="h-3 w-24 bg-gray-200/30 animate-pulse rounded mt-2"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp size={14} className="text-green-500 mr-1" />
                        <span className="text-xs text-gray-500">Growing steadily</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Icon Container */}
                <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/50`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
              
              {/* Decorative line */}
              <div className={`mt-4 h-1 w-16 rounded-full ${stat.color} opacity-30`}></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions with Enhanced Cards */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "View Orders", 
              description: "Check recent customer orders and manage deliveries", 
              href: "/admin/orders",
              icon: <ShoppingBag className="text-orange-600" size={24} />,
              bg: "bg-gradient-to-br from-orange-50 to-amber-50",
              border: "border-orange-100"
            },
            { 
              title: "Manage Products", 
              description: "Add, edit or remove products from your menu", 
              href: "/admin/products",
              icon: <Package className="text-blue-600" size={24} />,
              bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
              border: "border-blue-100"
            },
            { 
              title: "Customer Management", 
              description: "View and manage your customer database", 
              href: "/admin/customers",
              icon: <Users className="text-green-600" size={24} />,
              bg: "bg-gradient-to-br from-green-50 to-emerald-50",
              border: "border-green-100"
            }
          ].map((action, i) => (
            <motion.a
              key={i}
              href={action.href}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`block relative overflow-hidden rounded-2xl shadow-md border ${action.border} ${action.bg} hover:shadow-xl transition-all duration-300`}
            >
              {/* Decorative background */}
              <div className="absolute inset-0">
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full ${action.bg.replace('50', '100')} opacity-50`}></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 -ml-8 -mb-8 rounded-full ${action.bg.replace('50', '100')} opacity-30`}></div>
              </div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm`}>
                    {action.icon}
                  </div>
                </div>
                <div className="flex items-center text-green-600 font-medium text-sm group">
                  <span>Go to {action.title.split(" ")[0]}</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Recent Activity with Enhanced Design */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
        <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 -ml-24 -mb-24 rounded-full bg-gradient-to-tr from-gray-100 to-transparent opacity-30"></div>
          </div>
          
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Calendar className="text-gray-400" size={20} />
              <span className="text-gray-500">Today's Overview</span>
            </div>
            
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                <DollarSign className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 text-lg">Activity data will appear here</p>
              <p className="text-gray-400 text-sm mt-2">Recent orders and updates will be shown in this section</p>
            </div>
            
            {/* Decorative grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
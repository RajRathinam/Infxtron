import React from "react";
import { Users, Package, ShoppingBag } from "lucide-react";

const Dashboard = () => {
  // Example static data — replace these with real database values later
  const stats = [
    {
      title: "Total Customers",
      value: 1245,
      icon: <Users size={32} className="text-green-600" />,
      bg: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: 879,
      icon: <ShoppingBag size={32} className="text-orange-500" />,
      bg: "bg-orange-100",
    },
    {
      title: "Total Products",
      value: 56,
      icon: <Package size={32} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl text-center font-semibold text-gray-800">
        Welcome Back, Admin!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl shadow-md p-6 flex items-center justify-between ${stat.bg} transition-transform hover:scale-105 hover:shadow-lg`}
          >
            <div>
              <h2 className="text-gray-700 font-medium text-lg">
                {stat.title}
              </h2>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Optional Summary Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Overview Summary 
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Your store is growing steadily. Keep engaging with your customers and
          updating new healthy food products to maintain strong performance.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Eye, User, Phone, Mail, MapPin, MessageCircle, Gift, X } from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import Swal from "sweetalert2";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterEmail, setFilterEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/customers", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });

        let customersData = Array.isArray(res.data) ? res.data : [];

        // Sort from latest to oldest
        customersData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setCustomers(customersData);
        setFiltered(customersData);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to load customers",
          text: err.response?.data?.message || err.message,
        });
        setCustomers([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Search & Filter
  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let results = customers.filter((c) => {
      const combined = `${c.name || ""} ${c.phone || ""} ${c.email || ""}`.toLowerCase();
      return combined.includes(normalizedSearch);
    });

    if (filterEmail) {
      results = results.filter((c) => !!(c.email && c.email.trim() !== ""));
    }

    setFiltered(results);
  }, [search, filterEmail, customers]);

  // Delete Customer
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6dce00",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/api/customers/${id}`);
        setCustomers(customers.filter((c) => c.id !== id));
        Swal.fire("Deleted!", "Customer has been deleted.", "success");
      } catch (err) {
        console.error("Delete error:", err);

        // Check if it's because of associated orders
        const errorMessage =
          err.response?.data?.message ||
          "Failed to delete customer. Delete their orders first.";

        Swal.fire({
          icon: "error",
          title: "Cannot delete customer",
          text: errorMessage,
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
        <p className="text-gray-500">View and filter customer details.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6dce00] outline-none text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="filterEmail"
            checked={filterEmail}
            onChange={() => setFilterEmail((prev) => !prev)}
            className="accent-[#6dce00] w-4 h-4"
          />
          <label htmlFor="filterEmail" className="text-gray-700 text-sm font-medium">
            Show only customers with email
          </label>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <table className="w-full text-left text-gray-700">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Preferences</th>
              <th className="px-6 py-4 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c, index) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 text-sm hover:bg-green-50/50 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <User className="text-green-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-800 capitalize">{c.name || "Unknown"}</p>
                      
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {c.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="text-green-500" size={14} />
                          <span className="text-gray-700">{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="text-blue-500" size={14} />
                          <span className="text-gray-700 text-xs">{c.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {c.address ? (
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin className="text-orange-500 mt-0.5 flex-shrink-0" size={14} />
                        <span className="text-gray-600 text-xs leading-relaxed">{c.address}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No address</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Gift className={`${c.wantsOffers ? 'text-green-500' : 'text-gray-300'}`} size={16} />
                        <span className={`text-xs ${c.wantsOffers ? 'text-green-600' : 'text-gray-400'}`}>
                          {c.wantsOffers ? 'Want Offers' : 'No Offers'}
                        </span>
                      </div>
                      {c.message && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="text-purple-500" size={14} />
                          <span className="text-gray-500 text-xs">Has message</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedCustomer(c)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(c.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        title="Delete Customer"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <User size={48} className="mb-3 opacity-50" />
                    <p className="text-lg font-medium text-gray-500">No customers found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {search ? 'Try adjusting your search terms' : 'No customers in the system yet'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Beautiful Customer Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold capitalize">
                        {selectedCustomer.name || "Unknown Customer"}
                      </h2>
                      <p className="text-green-100 text-sm opacity-90">
                        Customer Details
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-green-500" />
                    Contact Information
                  </h3>
                  
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="text-green-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-800">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedCustomer.email && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Mail className="text-blue-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-800 text-sm">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address */}
                {selectedCustomer.address && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin size={16} className="text-orange-500" />
                      Delivery Address
                    </h3>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedCustomer.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Gift size={16} className="text-purple-500" />
                    Preferences
                  </h3>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Gift className={`${selectedCustomer.wantsOffers ? 'text-purple-500' : 'text-gray-400'} flex-shrink-0`} size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Marketing Preferences</p>
                      <p className={`font-medium ${selectedCustomer.wantsOffers ? 'text-purple-600' : 'text-gray-500'}`}>
                        {selectedCustomer.wantsOffers ? 'Wants to receive offers and updates' : 'Does not want promotional emails'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedCustomer.message && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <MessageCircle size={16} className="text-indigo-500" />
                      Customer Message
                    </h3>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{selectedCustomer.message}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Customer since {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
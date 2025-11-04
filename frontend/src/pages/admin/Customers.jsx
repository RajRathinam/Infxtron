import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterEmail, setFilterEmail] = useState(false);

  // Fetch customers from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${BASE_URL}/api/customers`, { credentials: "include" });
        const data = await res.json();

        // Ensure array
        const customersData = Array.isArray(data) ? data : [];
        setCustomers(customersData);
        setFiltered(customersData);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setCustomers([]);
        setFiltered([]);
      }
    };

    fetchCustomers();
  }, []);

  // Search and email filter logic
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
        <p className="text-gray-500">View and filter customer details.</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded shadow-md border border-gray-100">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6dce00] outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="filterEmail"
            checked={filterEmail}
            onChange={() => setFilterEmail((prev) => !prev)}
            className="accent-[#6dce00]"
          />
          <label htmlFor="filterEmail" className="text-gray-700 text-sm">
            Show only customers with email
          </label>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-x-auto bg-white rounded shadow-md border border-gray-100"
      >
        <table className="w-full text-left text-gray-700">
          <thead className="bg-green-100 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Wants Offers</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-200 text-xs hover:bg-green-50 transition"
                >
                  <td className="px-4 py-2 font-medium capitalize">{c.name || "-"}</td>
                  <td className="px-4 py-2">{c.phone || "-"}</td>
                  <td className="px-4 py-2">{c.email || "-"}</td>
                  <td className="px-4 py-2">{c.address || "-"}</td>
                  <td className="px-4 py-2">{c.message || "-"}</td>
                  <td className="px-4 py-2">
                    {c.wantsOffers ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Customers;

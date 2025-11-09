import React, { useEffect, useState, useRef } from "react";
import { Users, Package, ShoppingBag, Plus, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: "Total Customers", value: 0, icon: <Users size={32} className="text-green-600" />, bg: "bg-green-100" },
    { title: "Total Orders", value: 0, icon: <ShoppingBag size={32} className="text-orange-500" />, bg: "bg-orange-100" },
    { title: "Total Products", value: 0, icon: <Package size={32} className="text-blue-600" />, bg: "bg-blue-100" },
  ]);

  const [offers, setOffers] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const formRef = useRef(null);

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

  // Load offers from backend
  const loadOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await axiosInstance.get("/api/offers", {
        method: "GET",
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200) {
        const data = res.data;
        setOffers(Array.isArray(data) ? data.map((o) => ({ ...o, id: o.id || o._id })) : []);
      }
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadOffers();
  }, []);

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await axiosInstance.delete(`/api/offers/${id}`, {
      method: "DELETE",
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 200) {
      setOffers(offers.filter((o) => o.id !== id));
      await Swal.fire('Deleted!', 'The offer has been deleted.', 'success');
    } else {
      await Swal.fire('Failed!', 'Failed to delete offer.', 'error');
    }
  } catch (err) {
    console.error(err);
    await Swal.fire('Error!', err.response?.data?.message || 'Failed to delete offer.', 'error');
  }
};

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl text-center font-semibold text-gray-800">Welcome Back, Admin!</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-xl shadow-md p-6 flex items-center justify-between ${stat.bg} transition-transform hover:scale-105 hover:shadow-lg`}>
            <div>
              <h2 className="text-gray-700 font-medium text-lg">{stat.title}</h2>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Offers Header & Toggle Button */}
      <div className="flex justify-between items-center my-10">
        <h2 className="text-lg font-semibold text-gray-800 text-center">All Offers</h2>
        <button
          onClick={() => {
            setFormVisible(!formVisible);
            if (!formVisible && formRef.current) {
              setTimeout(() => {
                formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 150);
            }
          }}
          className="flex items-center gap-2 bg-[#6dce00] hover:bg-[#5bb300] text-white px-4 py-2 rounded shadow"
        >
          {formVisible ? <X size={20} /> : <Plus size={20} />}
          {formVisible ? "Close Form" : "New Offer"}
        </button>
      </div>

      {/* Offer Form */}
      <AnimatePresence>
        {formVisible && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden mt-4 pt-4"
          >
            <OfferBroadcastForm reloadOffers={loadOffers} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers List */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((o) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col border border-gray-300 gap-4 rounded p-4 shadow hover:shadow-lg relative"
              >
                {o.imagePath && <img src={o.imagePath} alt="Offer" className="w-full h-auto object-cover rounded mt-5" />}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{o.title}</h3>
                  {o.description && <p className="text-gray-600 text-sm">{o.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Created at: {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  title="Delete Offer"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No offers found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


// Offer Form Component
function OfferBroadcastForm({ reloadOffers }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);

const submit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  const fd = new FormData();
  fd.append("title", title);
  fd.append("description", description);
  if (image) fd.append("image", image);

  try {
    const res = await axiosInstance.post(`/api/offers?notify=${notify}`, fd, {
      method: "POST",
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 200 || res.status === 201) {
      setTitle("");
      setDescription("");
      setImage(null);
      setNotify(true);
      await Swal.fire(
        'Offer Created!',
        notify ? 'Offer created and emails sent!' : 'Offer created successfully!',
        'success'
      );
      reloadOffers();
      setFormVisible(!formVisible);
    } else {
      await Swal.fire('Failed!', 'Failed to create offer.', 'error');
    }
  } catch (err) {
    console.error(err);
    await Swal.fire('Error!', err.response?.data?.message || 'Failed to create offer.', 'error');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input
        className="border border-gray-300 rounded focus:outline-none px-3 py-2"
        placeholder="Offer title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="border border-gray-300 rounded focus:outline-none px-3 py-2"
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="border border-gray-300 rounded focus:outline-none px-3 py-2 md:col-span-2"
      />
      {/* <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
        />
        Send to all offer subscribers
      </label> */}
      <div className="md:col-span-2">
        <button
          disabled={submitting}
          className={`bg-[#6dce00] hover:bg-[#60b800] text-white px-4 py-2 rounded w-full ${
            submitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Creating..." : "Create Offer"}
        </button>
      </div>
    </form>
  );
}

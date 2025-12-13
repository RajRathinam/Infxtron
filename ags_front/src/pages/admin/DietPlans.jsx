// components/admin/DietPlansAdmin.jsx
import React, { useEffect, useState, useRef } from "react";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Ruler, 
  Scale, 
  Target,
  MessageSquare,
  Apple,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Stethoscope,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Heart,
  TrendingUp,
  Hash,
  Download,
  ChevronRight,
  Target as TargetIcon,
  Smartphone,
  MailCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";

const DietPlansAdmin = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    processing: 0,
    completed: 0,
    today: 0
  });
  
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "createdAt",
    order: "DESC"
  });
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editNotes, setEditNotes] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [statusUpdate, setStatusUpdate] = useState(null);
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("cards");
  const itemsPerPage = 12;

  // Load diet plans
  const loadDietPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: filters.sortBy,
        order: filters.order
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const res = await axiosInstance.get(`/api/diet-plans?${params.toString()}`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      
      setDietPlans(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      
      // Load stats
      const statsRes = await axiosInstance.get('/api/diet-plans/stats', {
        withCredentials: true
      });
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      
    } catch (err) {
      console.error("Failed to load diet plans:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load diet plans",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDietPlans();
  }, [currentPage, filters.status, filters.sortBy, filters.order]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      loadDietPlans();
    }
  };

  // Update diet plan status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/api/diet-plans/${id}`, {
        status: newStatus
      }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      
      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: `Diet plan status changed to ${newStatus}`,
      });
      
      setStatusUpdate(null);
      loadDietPlans();
      
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update status",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  // Update admin notes
  const handleUpdateNotes = async (id) => {
    if (!notesInput.trim()) return;
    
    try {
      await axiosInstance.put(`/api/diet-plans/${id}`, {
        notes: notesInput
      }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      
      Swal.fire({
        icon: "success",
        title: "Notes Updated!",
        text: "Admin notes have been saved.",
      });
      
      setEditNotes(null);
      setNotesInput("");
      loadDietPlans();
      
    } catch (err) {
      console.error("Failed to update notes:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update notes",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  // Resend Telegram notification
  const handleResendNotification = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Resend Notification?",
        text: "This will resend the Telegram notification for this diet plan request.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, resend",
        cancelButtonText: "Cancel"
      });
      
      if (result.isConfirmed) {
        await axiosInstance.post(`/api/diet-plans/${id}/resend-notification`, {}, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        
        Swal.fire({
          icon: "success",
          title: "Notification Sent!",
          text: "Telegram notification has been resent.",
        });
        
        loadDietPlans();
      }
      
    } catch (err) {
      console.error("Failed to resend notification:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to resend notification",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  // Delete diet plan
  const handleDelete = async (id, fullName) => {
    const result = await Swal.fire({
      title: `Delete ${fullName}'s Request?`,
      text: "This action cannot be undone. All data will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444"
    });
    
    if (result.isConfirmed) {
      setDeleting(id);
      try {
        await axiosInstance.delete(`/api/diet-plans/${id}`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Diet plan request has been deleted.",
        });
        
        loadDietPlans();
      } catch (err) {
        console.error("Failed to delete:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to delete",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  // Test Telegram notification
  const handleTestTelegram = async () => {
    try {
      await axiosInstance.post('/api/diet-plans/test-telegram', {}, {
        withCredentials: true
      });
      
      Swal.fire({
        icon: "success",
        title: "Test Sent!",
        text: "Test notification sent to Telegram.",
      });
    } catch (err) {
      console.error("Failed to send test:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to send test",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format short date
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, bg: '#fef3c7', text: '#92400e' },
      'contacted': { color: 'bg-blue-100 text-blue-800', icon: MessageSquare, bg: '#dbeafe', text: '#1e40af' },
      'processing': { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, bg: '#e9d5ff', text: '#6b21a8' },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, bg: '#d1fae5', text: '#065f46' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, bg: '#f3f4f6', text: '#374151' };
    const Icon = config.icon;
    
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        <Icon size={10} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get goal icon
  const getGoalIcon = (goal) => {
    if (goal?.toLowerCase().includes('weight')) return <Scale size={14} className="text-amber-500" />;
    if (goal?.toLowerCase().includes('muscle')) return <TrendingUp size={14} className="text-purple-500" />;
    if (goal?.toLowerCase().includes('health')) return <Heart size={14} className="text-pink-500" />;
    return <Apple size={14} className="text-green-500" />;
  };

  // Get status color for gradient
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'from-amber-500 to-yellow-600',
      'contacted': 'from-blue-500 to-indigo-600',
      'processing': 'from-purple-500 to-violet-600',
      'completed': 'from-emerald-500 to-teal-600'
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Diet Plan Requests</h1>
          <p className="text-gray-500">Manage customer diet plan requests and track their progress.</p>
        </div>
        {/* <div className="flex gap-3">
          <button
            onClick={loadDietPlans}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={handleTestTelegram}
            className="flex items-center gap-2 bg-[#6dce00] hover:bg-[#5bb300] text-white px-4 py-2 rounded-lg shadow transition"
          >
            <MessageSquare size={18} />
            Test Telegram
          </button>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-100" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100" },
          { label: "Contacted", value: stats.contacted, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-100" },
          { label: "Processing", value: stats.processing, icon: RefreshCw, color: "text-purple-500", bg: "bg-purple-100" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
          { label: "Today", value: stats.today, icon: Calendar, color: "text-[#6dce00]", bg: "bg-[#6dce00]/10" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
{/* Filters and Actions */}
<div className="bg-white p-4 rounded-lg shadow border border-gray-100">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    {/* First Row: Search Bar and Filter Button */}
    <div className="flex-1 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onKeyPress={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6dce00] focus:border-transparent text-sm sm:text-base"
        />
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex-1 sm:flex-none justify-center"
        >
          <Filter size={18} />
          <span className="hidden sm:inline">Filters</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </div>
    
  </div>

  {/* Advanced Filters */}
  <AnimatePresence>
    {showFilters && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6dce00] focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6dce00] focus:border-transparent text-sm"
            >
              <option value="createdAt">Date Created</option>
              <option value="updatedAt">Last Updated</option>
              <option value="fullName">Name</option>
              <option value="status">Status</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={filters.order}
              onChange={(e) => handleFilterChange('order', e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6dce00] focus:border-transparent text-sm"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  status: "",
                  search: "",
                  sortBy: "createdAt",
                  order: "DESC"
                });
              }}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin text-[#6dce00]" size={32} />
        </div>
      ) : dietPlans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <div className="text-gray-400 mb-4">
            <Users size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No diet plan requests found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : viewMode === "cards" ? (
        // Cards View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dietPlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{plan.fullName}</h3>
                    <p className="text-xs text-gray-500">
                      {plan.age}y • {plan.gender} • {formatShortDate(plan.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(plan.status)}
                    <span className="text-xs text-gray-400">
                      ID: {plan.id}
                    </span>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="text-gray-400" size={14} />
                    <span className="text-sm">{plan.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="text-gray-400" size={14} />
                    <span className="text-sm">{plan.height} cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="text-gray-400" size={14} />
                    <span className="text-sm">{plan.targetWeight || plan.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getGoalIcon(plan.mainGoal)}
                    <span className="text-sm truncate">{plan.mainGoal}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="text-gray-400" size={14} />
                    <span className="text-sm truncate">{plan.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="text-gray-400" size={14} />
                    <span className="text-sm">{plan.phone}</span>
                  </div>
                </div>

                {/* Diet Type */}
                <div className="flex items-center gap-2">
                  <Apple className="text-gray-400" size={14} />
                  <span className="text-sm font-medium">{plan.dietType}</span>
                </div>

                {/* Telegram Status */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-gray-400" size={14} />
                    <span>Telegram:</span>
                    {plan.telegramNotificationSent ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={12} />
                        Sent
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <AlertCircle size={12} />
                        Not sent
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {plan.preferredContact}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 border-t bg-gray-50 flex justify-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#dbeafe" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlan(plan)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#dcfce7" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusUpdate(plan)}
                  className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Status
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: deleting === plan.id ? 1 : 1.05, backgroundColor: "#fecaca" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(plan.id, plan.fullName)}
                  disabled={deleting === plan.id}
                  className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                    deleting === plan.id 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  {deleting === plan.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-left text-gray-700">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 uppercase text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Goals</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dietPlans.map((plan, index) => (
                <motion.tr
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 text-sm hover:bg-green-50/50 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-gray-400" />
                      <span className="text-gray-600 font-medium">{plan.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <User className="text-green-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{plan.fullName}</p>
                        <p className="text-xs hidden md:block text-gray-500">
                          {plan.age}y • {plan.gender} • {plan.height}cm • {plan.weight}kg
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="text-green-500" size={14} />
                        <span className="text-gray-700">{plan.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="text-blue-500" size={14} />
                        <span className="text-gray-700 text-xs">{plan.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TargetIcon className="text-amber-500" size={14} />
                        <span className="text-gray-700 text-sm">{plan.mainGoal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Apple className="text-green-500" size={14} />
                        <span className="text-gray-500 text-xs">{plan.dietType}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(plan.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={14} />
                      <span className="text-gray-600 text-xs">{formatDate(plan.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedPlan(plan)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStatusUpdate(plan)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
                        title="Change Status"
                      >
                        <RefreshCw size={18} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: deleting === plan.id ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(plan.id, plan.fullName)}
                        disabled={deleting === plan.id}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          deleting === plan.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                        title="Delete Request"
                      >
                        {deleting === plan.id ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Beautiful Diet Plan Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Gradient */}
              <div className={`p-6 text-white bg-gradient-to-r ${getStatusColor(selectedPlan.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold capitalize">
                        {selectedPlan.fullName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="opacity-90 text-sm">
                          Diet Plan Request
                        </span>
                        <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                          ID: {selectedPlan.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedPlan(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-green-500" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="text-gray-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-800">{selectedPlan.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="text-blue-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Age & Gender</p>
                        <p className="font-medium text-gray-800">{selectedPlan.age}y • {selectedPlan.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <Scale className="text-amber-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-medium text-gray-800">{selectedPlan.weight} kg</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Ruler className="text-green-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Height</p>
                        <p className="font-medium text-gray-800">{selectedPlan.height} cm</p>
                      </div>
                    </div>

                    {selectedPlan.targetWeight && (
                      <div className="col-span-2 flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Target className="text-purple-500 flex-shrink-0" size={18} />
                        <div>
                          <p className="text-sm text-gray-600">Target Weight</p>
                          <p className="font-medium text-gray-800">{selectedPlan.targetWeight} kg</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Phone size={16} className="text-blue-500" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Mail className="text-blue-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a 
                          href={`mailto:${selectedPlan.email}`}
                          className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {selectedPlan.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Phone className="text-green-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a 
                          href={`tel:${selectedPlan.phone}`}
                          className="font-medium text-green-600 hover:text-green-800 transition-colors"
                        >
                          {selectedPlan.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <MessageSquare className="text-purple-500 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Preferred Contact & Telegram</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-medium text-gray-800">{selectedPlan.preferredContact}</span>
                        <span className="flex items-center gap-1">
                          {selectedPlan.telegramNotificationSent ? (
                            <>
                              <CheckCircle size={14} className="text-green-500" />
                              <span className="text-xs text-green-600">Telegram Sent</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} className="text-amber-500" />
                              <span className="text-xs text-amber-600">Telegram Pending</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals & Preferences */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <TargetIcon size={16} className="text-amber-500" />
                    Goals & Preferences
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                      <TargetIcon className="text-amber-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Main Goal</p>
                        <p className="font-medium text-gray-800">{selectedPlan.mainGoal}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Apple className="text-green-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Diet Type</p>
                        <p className="font-medium text-gray-800">{selectedPlan.dietType}</p>
                      </div>
                    </div>
                  </div>

                  {selectedPlan.foodRestrictions && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Food Restrictions</p>
                        <p className="text-gray-700 text-sm">{selectedPlan.foodRestrictions}</p>
                      </div>
                    </div>
                  )}

                  {selectedPlan.dislikedFoods && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm text-gray-600">Disliked Foods</p>
                        <p className="text-gray-700 text-sm">{selectedPlan.dislikedFoods}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Stethoscope className="text-blue-500 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-600">Follow-up Consultation</p>
                      <p className={`font-medium ${selectedPlan.followUpConsultation === 'yes' ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedPlan.followUpConsultation === 'yes' ? 'Yes, interested' : 'No, not interested'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" />
                    Additional Information
                  </h3>
                  
                  {selectedPlan.additionalNotes && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Customer Notes</p>
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{selectedPlan.additionalNotes}"
                      </p>
                    </div>
                  )}

                  {selectedPlan.notes && (
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedPlan.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Submitted on {formatDate(selectedPlan.createdAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {statusUpdate && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setStatusUpdate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Update Status</h3>
                <p className="text-gray-600 mb-4">Change status for {statusUpdate.fullName}'s request</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['pending', 'contacted', 'processing', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(statusUpdate.id, status)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        statusUpdate.status === status
                          ? 'border-[#6dce00] bg-[#6dce00]/10 text-[#6dce00]'
                          : 'border-gray-200 hover:border-[#6dce00]/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${getStatusBadge(status).props.className.split(' ')[0]}`}>
                        {React.cloneElement(getStatusBadge(status).props.children[0], { size: 20 })}
                      </div>
                      <div className="font-medium capitalize">{status}</div>
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStatusUpdate(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Notes Modal */}
      <AnimatePresence>
        {editNotes && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setEditNotes(null);
              setNotesInput("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Edit Admin Notes</h3>
                <p className="text-gray-600 mb-4">Add notes for {editNotes.fullName}'s request</p>
                
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#6dce00] focus:border-transparent"
                  rows="4"
                  placeholder="Enter admin notes here..."
                />
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditNotes(null);
                      setNotesInput("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateNotes(editNotes.id)}
                    className="px-4 py-2 bg-[#6dce00] text-white rounded-lg hover:bg-[#5bb300] transition"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietPlansAdmin;
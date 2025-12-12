// components/Transactions.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trash2, 
  Eye, 
  CreditCard, 
  IndianRupee, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Filter,
  ExternalLink,
  RefreshCw,
  Shield
} from "lucide-react";
import axiosInstance from "../../utils/axiosConfig";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [deleting, setDeleting] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/transactions", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const transactionsData = Array.isArray(res.data?.transactions) 
        ? res.data.transactions 
        : [];

      setTransactions(transactionsData);
      setFiltered(transactionsData);
      
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load transactions",
        text: err.response?.data?.message || err.message,
      });
      setTransactions([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();
    let results = transactions.filter((t) => {
      const combined = `${t.transactionId || ""} 
                       ${t.merchantTransactionId || ""} 
                       ${t.Order?.Customer?.name || ""} 
                       ${t.Order?.Customer?.phone || ""}`
                       .toLowerCase();
      return combined.includes(normalizedSearch);
    });

    if (statusFilter !== "ALL") {
      results = results.filter((t) => t.paymentStatus === statusFilter);
    }

    setFiltered(results);
  }, [search, statusFilter, transactions]);

  // Update transaction status
  const updateTransactionStatus = async (id, status) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    
    try {
      const res = await axiosInstance.patch(
        `/api/transactions/${id}/status`,
        { paymentStatus: status },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.success) {
        // Update local state
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, paymentStatus: status } : t
          )
        );

        Swal.fire({
          icon: "success",
          title: "Status Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh data
        setTimeout(() => fetchTransactions(), 1000);
      }
    } catch (err) {
      console.error("Failed to update transaction status:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete this transaction record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6dce00",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    setDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      await axiosInstance.delete(`/api/transactions/${id}`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Transaction deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Format amount (paise to rupees)
// Format amount (already in rupees)
const formatAmountSimple = (amountInRupees) => {
  // Handle null, undefined, empty string
  if (amountInRupees === null || amountInRupees === undefined || amountInRupees === "") {
    return "₹0.00";
  }
  
  // Convert to number
  const amount = Number(amountInRupees);
  
  // Check if it's a valid number
  if (isNaN(amount)) {
    return "₹0.00";
  }
  
  // Amount is already in rupees, NO division by 100
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `₹${formatted}`;
};

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle size={14} className="text-green-600" />;
      case "PENDING":
        return <Clock size={14} className="text-yellow-600" />;
      case "FAILED":
        return <XCircle size={14} className="text-red-600" />;
      case "CANCELLED":
        return <AlertCircle size={14} className="text-gray-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (filtered.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data to Export",
        text: "There are no transactions to export.",
      });
      return;
    }

    try {
      const excelData = filtered.map((t) => ({
        "Transaction ID": t.transactionId || "N/A",
        "Merchant ID": t.merchantTransactionId || "N/A",
        "Order ID": t.Order?.id || "N/A",
        "Customer Name": t.Order?.Customer?.name || "N/A",
        "Customer Phone": t.Order?.Customer?.phone || "N/A",
        "Amount": formatAmountSimple(t.amount),
        "Currency": t.currency || "INR",
        "Payment Status": t.paymentStatus,
        "Payment Gateway": t.paymentGateway,
        "Transaction Date": formatDate(t.createdAt),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Transaction ID
        { wch: 25 }, // Merchant ID
        { wch: 10 }, // Order ID
        { wch: 20 }, // Customer Name
        { wch: 15 }, // Customer Phone
        { wch: 15 }, // Amount
        { wch: 10 }, // Currency
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Payment Gateway
        { wch: 20 }, // Transaction Date
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Transactions_Export_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      Swal.fire({
        icon: "success",
        title: "Export Successful!",
        text: `${filtered.length} transactions exported`,
        timer: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Failed to export transactions.",
      });
    }
  };

  // Get statistics
  const getStats = () => {
    const total = transactions.length;
    const successful = transactions.filter((t) => t.paymentStatus === "SUCCESS").length;
    const pending = transactions.filter((t) => t.paymentStatus === "PENDING").length;
    const failed = transactions.filter((t) => t.paymentStatus === "FAILED").length;
    const totalAmount = transactions
      .filter((t) => t.paymentStatus === "SUCCESS")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      total,
      successful,
      pending,
      failed,
      totalAmount: formatAmountSimple(totalAmount),
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Payment Transactions</h1>
          <p className="text-gray-500">Manage and monitor all payment transactions.</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToExcel}
            disabled={filtered.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filtered.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow-md"
            }`}
          >
            <Download size={16} />
            Export Excel ({filtered.length})
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Transactions</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          <div className="text-sm text-gray-500">Successful</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{stats.totalAmount}</div>
          <div className="text-sm text-gray-500">Total Amount</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Transaction ID, Customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1.5 rounded border border-blue-200">
            Showing: {filtered.length} transactions
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <table className="w-full text-left text-gray-700">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl">Transaction Details</th>
              <th className="px-6 py-4">Order & Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
                    <p className="text-gray-500">Loading transactions...</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 text-sm hover:bg-green-50/50 transition-all duration-200"
                >
                  {/* Transaction Details */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-blue-500" size={16} />
                        <div>
                          <p className="text-xs font-mono text-gray-800 font-medium">
                            {transaction.transactionId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="text-gray-400" size={14} />
                        <span className="text-xs text-gray-600">
                          {transaction.paymentGateway || "PHONEPE"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Order & Customer */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {transaction.Order ? (
                        <>
                          <div>
                            <p className="text-xs font-medium text-gray-800">
                              Order #{transaction.Order.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.Order.Customer?.name || "Unknown"}
                            </p>
                          </div>
                          {transaction.Order.Customer?.phone && (
                            <p className="text-xs text-gray-600">
                              {transaction.Order.Customer.phone}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No order linked
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="text-green-600" size={16} />
                      <div>
                        <p className="text-base font-bold text-gray-800">
                          {formatAmountSimple(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.currency || "INR"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          transaction.paymentStatus
                        )}`}
                      >
                        {getStatusIcon(transaction.paymentStatus)}
                        {transaction.paymentStatus || "UNKNOWN"}
                      </span>
                      
                  
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </motion.button>

                      {transaction.redirectUrl && (
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          href={transaction.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
                          title="Open Payment Link"
                        >
                          <ExternalLink size={18} />
                        </motion.a>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteTransaction(transaction.id)}
                        disabled={deleting[transaction.id]}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        title="Delete Transaction"
                      >
                        {deleting[transaction.id] ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <CreditCard size={48} className="mb-3 opacity-50" />
                    <p className="text-lg font-medium text-gray-500">
                      No transactions found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {search || statusFilter !== "ALL"
                        ? "Try adjusting your filters"
                        : "No transactions in the system yet"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        Transaction Details
                      </h2>
                      <p className="text-blue-100 text-sm opacity-90">
                        ID: {selectedTransaction.transactionId}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTransaction(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XCircle size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Transaction Info</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">Transaction ID</p>
                        <p className="font-mono text-sm font-medium">
                          {selectedTransaction.transactionId}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">Merchant ID</p>
                        <p className="font-mono text-sm font-medium">
                          {selectedTransaction.merchantTransactionId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Payment Details</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatAmountSimple(selectedTransaction.amount)}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">Status</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedTransaction.paymentStatus)}
                          <span className={`font-medium ${getStatusColor(selectedTransaction.paymentStatus).split(" ")[1]}`}>
                            {selectedTransaction.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order & Customer Info */}
                {selectedTransaction.Order && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Order & Customer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                          Order Information
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-gray-600">Order ID:</span>{" "}
                            <span className="font-medium">#{selectedTransaction.Order.id}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Total:</span>{" "}
                            <span className="font-medium">₹{selectedTransaction.Order.totalPrice}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">
                          Customer Information
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-gray-600">Name:</span>{" "}
                            <span className="font-medium">{selectedTransaction.Order.Customer?.name || "N/A"}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Phone:</span>{" "}
                            <span className="font-medium">{selectedTransaction.Order.Customer?.phone || "N/A"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gateway Response */}
                {selectedTransaction.gatewayResponse && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Gateway Response</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedTransaction.gatewayResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Created At</p>
                      <p className="text-sm font-medium">{formatDate(selectedTransaction.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Updated At</p>
                      <p className="text-sm font-medium">{formatDate(selectedTransaction.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
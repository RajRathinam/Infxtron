import React, { useEffect, useState, useRef } from "react";
import { Plus, X, ImagePlus, Pencil, Trash2, Eye, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [formVisible, setFormVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [viewOffer, setViewOffer] = useState(null);

  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imagePath: "",
  });

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/offers", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      setOffers(res.data || []);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Failed to load offers",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Scroll to form and focus first input when form becomes visible
  useEffect(() => {
    if (formVisible && formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });

      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 300);
    }
  }, [formVisible]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (offer) => {
    console.log("Editing offer:", offer);
    
    setEditingOffer(offer);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      imagePath: offer.imagePath || "",
    });
    setPreviewImage(offer.imagePath || null);
    setFormVisible(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData();

  console.log("Form data to submit:", formData);

  // Add all form fields
  Object.entries(formData).forEach(([key, value]) => {
    if (value) {
      fd.append(key, value);
    }
  });

  if (imageFile) {
    fd.append("image", imageFile);
  }

  setSubmitting(true);
  try {
    if (editingOffer) {
      const offerId = editingOffer.id || editingOffer._id;
      console.log("Updating offer ID:", offerId);
      
      // Make sure we're sending all required fields
      // Some APIs require PUT to include all fields
      const response = await axiosInstance.put(`/api/offers/${offerId}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Update response:", response.data);
      
      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Offer updated successfully.",
      });
    } else {
      // For creating new offer
      const response = await axiosInstance.post("/api/offers", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Create response:", response.data);
      
      await Swal.fire({
        icon: "success",
        title: "Added!",
        text: "Offer added successfully.",
      });
    }
  } catch (err) {
    console.error("Submission error:", err);
    console.error("Error response:", err.response?.data);
    
    // More detailed error message
    let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
    if (err.response?.status === 500) {
      errorMessage = "Server error. Please check if all required fields are provided.";
    }
    
    await Swal.fire({
      icon: "error",
      title: "Failed!",
      text: errorMessage,
    });
  } finally {
    setSubmitting(false);
    resetForm();
    await loadOffers();
  }
};

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imagePath: "",
    });
    setImageFile(null);
    setPreviewImage(null);
    setFormVisible(false);
    setEditingOffer(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This offer will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setDeleting(id);
      try {
        await axiosInstance.delete(`/api/offers/${id}`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Offer has been deleted.",
        });
        await loadOffers();
      } catch (err) {
        console.error(err);
        await Swal.fire({
          icon: "error",
          title: "Failed!",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Truncate text for table display
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Offers</h1>
        <p className="text-gray-500">Create and manage special offers for your customers.</p>
      </div>

      {/* Offers Table */}
      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-100">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-green-100 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-500">Loading offers...</span>
                  </div>
                </td>
              </tr>
            ) : offers.length > 0 ? (
              [...offers].reverse().map((o) => (
                <tr key={o.id || o._id} className="border-b border-gray-300 text-xs hover:bg-green-50 transition">
                  <td className="px-4 py-2 text-gray-500">{o.id || o._id}</td>
                  <td className="px-4 py-2">
                    <img 
                      src={o.imagePath} 
                      alt={o.title} 
                      className="w-10 h-10 rounded object-cover border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/40x40/e5e7eb/6b7280?text=No+Image';
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">{o.title}</td>
                  <td className="px-4 py-2" title={o.description}>
                    {truncateText(o.description, 60)}
                  </td>
                  <td className="px-4 py-2">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-2">{formatDate(o.updatedAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-2">
                      {/* View Button */}
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#dbeafe" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setViewOffer(o)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        title="View Details"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </motion.button>

                      {/* Edit Button */}
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(o)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200"
                        title="Edit Offer"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </motion.button>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: deleting === (o.id || o._id) ? 1 : 1.1, backgroundColor: "#fecaca" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(o.id || o._id)}
                        disabled={deleting === (o.id || o._id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          deleting === (o.id || o._id) 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title="Delete Offer"
                      >
                        {deleting === (o.id || o._id) ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} className="text-red-600" />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No offers found. Create your first offer to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Offer Button */}
      <div className="flex justify-start">
        <button
          onClick={() => {
            if (formVisible) {
              resetForm();
            } else {
              setFormVisible(true);
            }
          }}
          className="flex items-center gap-2 bg-[#6dce00] hover:bg-[#5bb300] text-white px-5 py-2.5 rounded-lg shadow-md transition"
        >
          {formVisible ? <X size={20} /> : <Plus size={20} />}
          {formVisible ? "Close Form" : "Add Offer"}
        </button>
      </div>

      {/* Slide-down Form with ref */}
      <div ref={formRef}>
        <AnimatePresence>
          {formVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white shadow-lg border border-gray-200 rounded-xl p-6 mt-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingOffer ? `Edit Offer: ${editingOffer.title}` : "Add New Offer"}
                {editingOffer && (
                  <span className="text-sm text-gray-500 ml-2">
                    (ID: {editingOffer.id || editingOffer._id})
                  </span>
                )}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Text Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Title *
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="title"
                    placeholder="Enter offer title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter offer description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows="3"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Image {!editingOffer && "*"}
                  </label>
                  <div className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded">
                    <label className="cursor-pointer flex flex-col items-center">
                      <ImagePlus size={40} className="text-gray-400" />
                      <span className="text-gray-500 text-sm mt-1">Click to upload image</span>
                      <span className="text-gray-400 text-xs mt-1">(JPG, PNG, JPEG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        required={!editingOffer}
                      />
                    </label>
                    {previewImage && (
                      <div className="mt-3 text-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded border mx-auto"
                        />
                        <p className="text-xs text-gray-500 mt-1">Preview</p>
                      </div>
                    )}
                  </div>
                  {editingOffer && !previewImage && (
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Current image will be kept if no new image is selected
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded transition font-medium ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingOffer ? "Updating..." : "Adding..."}
                      </span>
                    ) : editingOffer ? "Update Offer" : "Add Offer"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Offer Popup - Centered */}
      <AnimatePresence>
        {viewOffer && (
          <motion.div
            className="fixed inset-0 bg-black/30 px-5 flex items-center justify-center z-50 overflow-auto py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewOffer(null)}
          >
            <motion.div
              key={viewOffer.id || viewOffer._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={viewOffer.imagePath}
                  alt={viewOffer.title}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400/e5e7eb/6b7280?text=No+Image';
                  }}
                />
                <button
                  onClick={() => setViewOffer(null)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg hover:bg-white transition-all"
                >
                  <X size={16} className="text-gray-800" />
                </button>
              </div>

              <div className="p-5 flex flex-col space-y-3">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800">
                  {viewOffer.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600">{viewOffer.description}</p>

                {/* Dates */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 items-center">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-[#6dce00]" />
                    <span>Created: {formatDate(viewOffer.createdAt)}</span>
                  </div>
                  {viewOffer.updatedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#6dce00]" />
                      <span>Updated: {formatDate(viewOffer.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {/* ID */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Offer ID: <span className="font-medium">{viewOffer.id || viewOffer._id}</span>
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

export default Offers;
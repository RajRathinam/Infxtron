import React, { useEffect, useState, useRef } from "react";
import { Plus, X, ImagePlus, Pencil, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [formVisible, setFormVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [viewProduct, setViewProduct] = useState(null);

  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  const [formData, setFormData] = useState({
    productName: "",
    packName: "",
    weight: "",
    proteinIntake: "",
    availableDay: "",
    availableTime: "",
    singleOrder: "",
    weeklySubscription: "",
    monthlySubscription: "",
    imagePath: "",
    ingredients: "",
    discounts: "",
    description: "",
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/products", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Failed to load products",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Scroll to form and focus first input when form becomes visible
  useEffect(() => {
    if (formVisible && formRef.current) {
      // Smooth scroll to form
      formRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });

      // Focus first input after a small delay to ensure form is visible
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName || "",
      packName: product.packName || "",
      weight: product.weight || "",
      proteinIntake: product.proteinIntake || "",
      availableDay: product.availableDay || "",
      availableTime: product.availableTime || "",
      singleOrder: product.singleOrder || "",
      weeklySubscription: product.weeklySubscription || "",
      monthlySubscription: product.monthlySubscription || "",
      imagePath: product.imagePath || "",
      ingredients: product.ingredients ? product.ingredients.join(",") : "",
      discounts: product.discounts ? product.discounts.join(",") : "",
      description: product.description || "",
    });
    setPreviewImage(product.imagePath || null);
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    const ingredientsArray = formData.ingredients
      ? formData.ingredients.split(",").map((i) => i.trim())
      : [];
    const discountsArray = formData.discounts
      ? formData.discounts.split(",").map((d) => d.trim())
      : [];

    Object.entries(formData).forEach(([k, v]) => {
      if (k === "ingredients") fd.append(k, JSON.stringify(ingredientsArray));
      else if (k === "discounts") fd.append(k, JSON.stringify(discountsArray));
      else fd.append(k, v);
    });

    if (imageFile) fd.append("image", imageFile);

    setSubmitting(true);
    try {
      if (editingProduct) {
        await axiosInstance.put(`/api/products/${editingProduct.id}`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Product updated successfully.",
        });
      } else {
        await axiosInstance.post("/api/products", fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Product added successfully.",
        });
      }
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
      setFormData({
        productName: "",
        packName: "",
        weight: "",
        proteinIntake: "",
        availableDay: "",
        availableTime: "",
        singleOrder: "",
        weeklySubscription: "",
        monthlySubscription: "",
        imagePath: "",
        ingredients: "",
        discounts: "",
        description: "",
      });
      setImageFile(null);
      setPreviewImage(null);
      setFormVisible(false);
      setEditingProduct(null);
      await loadProducts();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setDeleting(id);
      try {
        await axiosInstance.delete(`/api/products/${id}`, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product has been deleted.",
        });
        await loadProducts();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <p className="text-gray-500">Manage and add your healthy food products.</p>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-100">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-green-100 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Pack</th>
              <th className="px-4 py-3">Picture</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Protein</th>
              <th className="px-4 py-3">Single</th>
              <th className="px-4 py-3">Weekly</th>
              <th className="px-4 py-3">Monthly</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              [...products].reverse().map((p) => (
                <tr key={p.id} className="border-b border-gray-300 text-xs hover:bg-green-50 transition">
                  <td className="px-4 py-2 font-medium">{p.productName}</td>
                  <td className="px-4 py-2">{p.packName}</td>
                  <td className="px-4 py-2">
                    <img src={p.imagePath} alt={p.productName} className="w-10 h-10 rounded object-cover border" />
                  </td>
                  <td className="px-4 py-2">{p.weight}</td>
                  <td className="px-4 py-2">{p.proteinIntake}</td>
                  <td className="px-4 py-2">₹{p.singleOrder}</td>
                  <td className="px-4 py-2">₹{p.weeklySubscription}</td>
                  <td className="px-4 py-2">₹{p.monthlySubscription}</td>
                  <td className="px-4 py-2">{p.availableDay}</td>
                  <td className="px-4 py-2">{p.availableTime}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-2">
                      {/* View Button */}
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#dbeafe" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setViewProduct(p)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                        title="View Details"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </motion.button>

                      {/* Edit Button */}
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(p)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200"
                        title="Edit Product"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </motion.button>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: deleting === p.id ? 1 : 1.1, backgroundColor: "#fecaca" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          deleting === p.id 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title="Delete Product"
                      >
                        {deleting === p.id ? (
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
                <td colSpan="11" className="text-center py-6 text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Button */}
      <div className="flex justify-start">
        <button
          onClick={() => {
            setFormVisible(!formVisible);
            setEditingProduct(null);
            setFormData({
              productName: "",
              packName: "",
              weight: "",
              proteinIntake: "",
              availableDay: "",
              availableTime: "",
              singleOrder: "",
              weeklySubscription: "",
              monthlySubscription: "",
              imagePath: "",
              ingredients: "",
              discounts: "",
              description: "",
            });
            setPreviewImage(null);
          }}
          className="flex items-center gap-2 bg-[#6dce00] hover:bg-[#5bb300] text-white px-5 py-2.5 rounded-lg shadow-md transition"
        >
          {formVisible ? <X size={20} /> : <Plus size={20} />}
          {formVisible ? "Close Form" : "Add Product"}
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
              className="bg-white shadow-lg border border-gray-200 rounded-xl p-4 mt-2"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* Text Fields */}
                {[
                  { name: "productName", placeholder: "Product Name" },
                  { name: "packName", placeholder: "Pack Name" },
                  { name: "weight", placeholder: "Weight (e.g., 250g)" },
                  { name: "proteinIntake", placeholder: "Protein Intake (e.g., 20g)" },
                  { name: "availableDay", placeholder: "Available Day" },
                  { name: "availableTime", placeholder: "Available Time" },
                  { name: "singleOrder", placeholder: "Single Order Price (₹)" },
                  { name: "weeklySubscription", placeholder: "Weekly Subscription (₹)" },
                  { name: "monthlySubscription", placeholder: "Monthly Subscription (₹)" },
                  { name: "ingredients", placeholder: "Ingredients (comma separated)" },
                  { name: "discounts", placeholder: "Discounts (comma separated)" },
                  { name: "description", placeholder: "Description" },
                ].map((field, index) => (
                  <input
                    key={field.name}
                    ref={index === 0 ? firstInputRef : null}
                    type="text"
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required={field.name !== "discounts"}
                  />
                ))}

                {/* Image Upload */}
                <div className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 p-3 rounded">
                  <label className="cursor-pointer flex flex-col items-center">
                    <ImagePlus size={40} className="text-gray-400" />
                    <span className="text-gray-500 text-sm mt-1">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mt-2 w-24 h-24 object-cover rounded border"
                    />
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`col-span-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {submitting ? (editingProduct ? "Updating..." : "Adding...") : editingProduct ? "Update Product" : "Add Product"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Product Popup */}
      <AnimatePresence>
        {viewProduct && (
          <motion.div
            className="fixed inset-0 bg-black/30 px-5 flex justify-center items-start z-50 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewProduct(null)}
          >
            <motion.div
              key={viewProduct.id}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 100 }}
              exit={{ opacity: 0, y: -200 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="bg-white rounded-xl shadow-lg w-full max-w-md mt-20 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={viewProduct.imagePath}
                  alt={viewProduct.productName}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#6dce00]/80 text-white text-xs px-3 py-1 rounded-full shadow">
                  {viewProduct.packName}
                </span>
                <button
                  onClick={() => setViewProduct(null)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500 rounded-full p-1"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 flex flex-col space-y-2">
                <h3 className="text-lg font-bold text-gray-800">{viewProduct.productName}</h3>
                <p className="text-xs text-gray-500">{viewProduct.description}</p>
                <div className="flex flex-wrap gap-4 text-[12px] text-gray-600 mt-2 items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[#6dce00]">Weight:</span> {viewProduct.weight}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#6dce00]">Protein:</span> {viewProduct.proteinIntake}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#6dce00]">Day:</span> {viewProduct.availableDay}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#6dce00]">Time:</span> {viewProduct.availableTime}
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#6dce00] mt-2">
                  ₹{viewProduct.singleOrder} <span className="text-xs text-gray-500">/ item</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
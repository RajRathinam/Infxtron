import React, { useEffect, useState, useRef } from "react";
import { Plus, X, ImagePlus, Pencil, Trash2, Eye, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";
import {
  ShoppingBasket,
  Dumbbell,Calendar
} from "lucide-react";

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

  // State for array inputs
  const [availableDayInput, setAvailableDayInput] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    packName: "",
    weight: "",
    proteinIntake: "",
    availableDay: [],
    availableTime: "",
    singleOrder: "",
    weeklySubscription: "",
    monthlySubscription: "",
    imagePath: "",
    ingredients: [],
    discounts: "",
    description: "",
  });

  // Helper function to parse availableDay field
  const parseAvailableDay = (availableDay) => {
    if (!availableDay) return [];
    
    // If it's already an array, return it
    if (Array.isArray(availableDay)) return availableDay;
    
    // If it's a string, try to parse it
    if (typeof availableDay === 'string') {
      // Handle the specific malformed format: {"Saturday","Sunday","Monday"}
      if (availableDay.startsWith('{') && availableDay.endsWith('}')) {
        try {
          // Remove curly braces and split by commas
          const withoutBraces = availableDay.slice(1, -1);
          // Remove quotes and trim each day
          const days = withoutBraces.split(',').map(day => 
            day.replace(/"/g, '').trim()
          ).filter(day => day);
          return days;
        } catch (error) {
          // Continue to next method if this fails
        }
      }
      
      // Try JSON.parse for properly formatted arrays
      try {
        const parsed = JSON.parse(availableDay);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Continue to next method if this fails
      }
      
      // Simple comma splitting as fallback
      try {
        const days = availableDay.split(',').map(day => 
          day.replace(/[{"}]/g, '').trim()
        ).filter(day => day);
        return days;
      } catch (error) {
        // Return empty array if all methods fail
      }
    }
    
    return [];
  };

  // Helper function to parse ingredients field
  const parseIngredients = (ingredients) => {
    if (!ingredients) return [];
    
    // If it's already an array, return it
    if (Array.isArray(ingredients)) return ingredients;
    
    // If it's a string, try to parse it
    if (typeof ingredients === 'string') {
      // Handle the specific malformed format
      if (ingredients.startsWith('{') && ingredients.endsWith('}')) {
        try {
          const withoutBraces = ingredients.slice(1, -1);
          const items = withoutBraces.split(',').map(item => 
            item.replace(/"/g, '').trim()
          ).filter(item => item);
          return items;
        } catch (error) {
          // Continue to next method if this fails
        }
      }
      
      // Try JSON.parse
      try {
        const parsed = JSON.parse(ingredients);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        // Continue to next method if this fails
      }
      
      // Simple comma splitting as fallback
      try {
        const items = ingredients.split(',').map(item => 
          item.replace(/[{"}]/g, '').trim()
        ).filter(item => item);
        return items;
      } catch (error) {
        // Return empty array if all methods fail
      }
    }
    
    return [];
  };

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

  // Add day to availableDay array
  const addAvailableDay = () => {
    const day = availableDayInput.trim();
    if (day && !formData.availableDay.includes(day)) {
      setFormData({
        ...formData,
        availableDay: [...formData.availableDay, day]
      });
      setAvailableDayInput("");
    }
  };

  // Remove day from availableDay array
  const removeAvailableDay = (dayToRemove) => {
    setFormData({
      ...formData,
      availableDay: formData.availableDay.filter(day => day !== dayToRemove)
    });
  };

  // Add ingredient to ingredients array
  const addIngredient = () => {
    const ingredient = ingredientsInput.trim();
    if (ingredient && !formData.ingredients.includes(ingredient)) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredient]
      });
      setIngredientsInput("");
    }
  };

  // Remove ingredient from ingredients array
  const removeIngredient = (ingredientToRemove) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ingredient => ingredient !== ingredientToRemove)
    });
  };

  // Handle Enter key for both inputs
  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'day') {
        addAvailableDay();
      } else if (type === 'ingredient') {
        addIngredient();
      }
    }
  };

  const handleEdit = (product) => {
    console.log("Editing product:", product); // Debug log
    
    // Parse the arrays from the database
    const availableDays = parseAvailableDay(product.availableDay);
    const ingredientsList = parseIngredients(product.ingredients);
    
    // Handle discounts - check if it's an array or string
    let discountsValue = "";
    if (product.discounts) {
      if (Array.isArray(product.discounts)) {
        discountsValue = product.discounts.join(", ");
      } else if (typeof product.discounts === 'string') {
        try {
          const parsed = JSON.parse(product.discounts);
          if (Array.isArray(parsed)) {
            discountsValue = parsed.join(", ");
          } else {
            discountsValue = product.discounts;
          }
        } catch (error) {
          discountsValue = product.discounts;
        }
      }
    }

    setEditingProduct(product);
    setFormData({
      productName: product.productName || "",
      packName: product.packName || "",
      weight: product.weight || "",
      proteinIntake: product.proteinIntake || "",
      availableDay: availableDays,
      availableTime: product.availableTime || "",
      singleOrder: product.singleOrder || "",
      weeklySubscription: product.weeklySubscription || "",
      monthlySubscription: product.monthlySubscription || "",
      imagePath: product.imagePath || "",
      ingredients: ingredientsList,
      discounts: discountsValue,
      description: product.description || "",
    });
    setPreviewImage(product.imagePath || null);
    setAvailableDayInput("");
    setIngredientsInput("");
    setFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    // Format discounts as array
    const discountsArray = formData.discounts
      ? formData.discounts.split(",").map((d) => d.trim()).filter(d => d)
      : [];

    console.log("Form data to submit:", formData); // Debug log

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "availableDay" || key === "ingredients") {
        // Stringify arrays
        fd.append(key, JSON.stringify(value));
      } else if (key === "discounts") {
        fd.append(key, JSON.stringify(discountsArray));
      } else {
        fd.append(key, value);
      }
    });

    if (imageFile) {
      fd.append("image", imageFile);
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        // Check what ID field your product has
        const productId = editingProduct.id || editingProduct._id;
        console.log("Updating product ID:", productId); // Debug log
        
        const response = await axiosInstance.put(`/api/products/${productId}`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        console.log("Update response:", response.data); // Debug log
        
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Product updated successfully.",
        });
      } else {
        const response = await axiosInstance.post("/api/products", fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        console.log("Create response:", response.data); // Debug log
        
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Product added successfully.",
        });
      }
    } catch (err) {
      console.error("Submission error:", err); // Debug log
      console.error("Error response:", err.response?.data); // Debug log
      
      await Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err.response?.data?.message || err.response?.data?.error || err.message,
      });
    } finally {
      setSubmitting(false);
      resetForm();
      await loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      packName: "",
      weight: "",
      proteinIntake: "",
      availableDay: [],
      availableTime: "",
      singleOrder: "",
      weeklySubscription: "",
      monthlySubscription: "",
      imagePath: "",
      ingredients: [],
      discounts: "",
      description: "",
    });
    setAvailableDayInput("");
    setIngredientsInput("");
    setImageFile(null);
    setPreviewImage(null);
    setFormVisible(false);
    setEditingProduct(null);
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

  // Format array for display in table
  const formatArrayDisplay = (arr) => {
    if (!Array.isArray(arr)) return "-";
    return arr.slice(0, 2).join(", ") + (arr.length > 2 ? `... (+${arr.length - 2})` : "");
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
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Pack</th>
              <th className="px-4 py-3">Picture</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Protein</th>
              <th className="px-4 py-3">Single</th>
              <th className="px-4 py-3">Weekly</th>
              <th className="px-4 py-3">Monthly</th>
              <th className="px-4 py-3">Available Days</th>
              <th className="px-4 py-3">Ingredients</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              [...products].reverse().map((p) => (
                <tr key={p.id || p._id} className="border-b border-gray-300 text-xs hover:bg-green-50 transition">
                  <td className="px-4 py-2 text-gray-500">{p.id || p._id}</td>
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
                  <td className="px-4 py-2" title={formatArrayDisplay(parseAvailableDay(p.availableDay))}>
                    {formatArrayDisplay(parseAvailableDay(p.availableDay))}
                  </td>
                  <td className="px-4 py-2" title={formatArrayDisplay(parseIngredients(p.ingredients))}>
                    {formatArrayDisplay(parseIngredients(p.ingredients))}
                  </td>
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
                        whileHover={{ scale: deleting === (p.id || p._id) ? 1 : 1.1, backgroundColor: "#fecaca" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(p.id || p._id)}
                        disabled={deleting === (p.id || p._id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          deleting === (p.id || p._id) 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title="Delete Product"
                      >
                        {deleting === (p.id || p._id) ? (
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
                <td colSpan="13" className="text-center py-6 text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Button */}
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
              className="bg-white shadow-lg border border-gray-200 rounded-xl p-6 mt-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingProduct ? `Edit Product: ${editingProduct.productName}` : "Add New Product"}
                {editingProduct && (
                  <span className="text-sm text-gray-500 ml-2">
                    (ID: {editingProduct.id || editingProduct._id})
                  </span>
                )}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Text Fields */}
                {[
                  { name: "productName", placeholder: "Product Name", required: true },
                  { name: "packName", placeholder: "Pack Name", required: true },
                  { name: "weight", placeholder: "Weight (e.g., 250g)", required: true },
                  { name: "proteinIntake", placeholder: "Protein Intake (e.g., 20g)", required: true },
                  { name: "availableTime", placeholder: "Available Time (e.g., Morning, Evening)", required: true },
                  { name: "singleOrder", placeholder: "Single Order Price (₹)", required: true, type: "number" },
                  { name: "weeklySubscription", placeholder: "Weekly Subscription (₹)", required: true, type: "number" },
                  { name: "monthlySubscription", placeholder: "Monthly Subscription (₹)", required: true, type: "number" },
                  { name: "discounts", placeholder: "Discounts (comma separated)", required: false },
                  { name: "description", placeholder: "Description", required: false },
                ].map((field, index) => (
                  <div key={field.name}>
                    <input
                      ref={index === 0 ? firstInputRef : null}
                      type={field.type || "text"}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required={field.required}
                    />
                  </div>
                ))}

                {/* Available Days Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Available Days *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add day (e.g., Monday)"
                      value={availableDayInput}
                      onChange={(e) => setAvailableDayInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'day')}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                      type="button"
                      onClick={addAvailableDay}
                      className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.availableDay.length > 0 ? (
                      formData.availableDay.map((day, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag size={12} />
                          {day}
                          <button
                            type="button"
                            onClick={() => removeAvailableDay(day)}
                            className="text-green-600 hover:text-green-800 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No days added yet</span>
                    )}
                  </div>
                </div>

                {/* Ingredients Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ingredients</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add ingredient"
                      value={ingredientsInput}
                      onChange={(e) => setIngredientsInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'ingredient')}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.ingredients.length > 0 ? (
                      formData.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag size={12} />
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => removeIngredient(ingredient)}
                            className="text-blue-600 hover:text-blue-800 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No ingredients added yet</span>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Product Image {!editingProduct && "*"}
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
                        required={!editingProduct} // Required only for new products
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
                  {editingProduct && !previewImage && (
                    <p className="text-xs text-gray-500 text-center">
                      Current image will be kept if no new image is selected
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="col-span-full flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded transition font-medium ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingProduct ? "Updating..." : "Adding..."}
                      </span>
                    ) : editingProduct ? "Update Product" : "Add Product"}
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

{/* View Product Popup - Centered */}
<AnimatePresence>
  {viewProduct && (
    <motion.div
      className="fixed inset-0 bg-black/30 px-5 flex items-center justify-center z-50 overflow-auto py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setViewProduct(null)}
    >
      <motion.div
        key={viewProduct.id || viewProduct._id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
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
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg hover:bg-white transition-all"
          >
            <X size={16} className="text-gray-800" />
          </button>
        </div>

        <div className="p-5 flex flex-col space-y-3">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800">
            {viewProduct.productName}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500">{viewProduct.description}</p>

          {/* Weight and Protein */}
          <div className="flex flex-wrap gap-4 text-[12px] text-gray-600 items-center">
            <div className="flex items-center gap-1">
              <ShoppingBasket size={14} className="text-[#6dce00]" />
              <span>Weight: {viewProduct.weight}</span>
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell size={14} className="text-[#6dce00]" />
              <span>Protein: {viewProduct.proteinIntake}</span>
            </div>
          </div>

          {/* Available Days */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Available Days:</h4>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const availableDays = parseAvailableDay(viewProduct.availableDay);
                return availableDays.length > 0 ? (
                  availableDays.map((day, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {day}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-xs">No days specified</span>
                );
              })()}
            </div>
          </div>

          {/* Rate */}
          <p className="text-sm font-semibold text-[#6dce00]">
            ₹{viewProduct.singleOrder}{" "}
            <span className="text-xs text-gray-500">/ item</span>
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
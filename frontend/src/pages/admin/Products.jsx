import React, { useState, useEffect } from "react";
import { Plus, X, ImagePlus, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { productsAPI } from "../../utils/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
    ingredients: "",
    description: "",
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getAll();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load products. Please try again.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
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
      ingredients: "",
      description: "",
    });
    setImageFile(null);
    setPreviewImage(null);
    setEditingProduct(null);
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("productName", formData.productName);
      formDataToSend.append("packName", formData.packName);
      formDataToSend.append("weight", formData.weight);
      formDataToSend.append("proteinIntake", formData.proteinIntake);
      formDataToSend.append("availableDay", formData.availableDay);
      formDataToSend.append("availableTime", formData.availableTime);
      formDataToSend.append("singleOrder", formData.singleOrder);
      formDataToSend.append("weeklySubscription", formData.weeklySubscription);
      formDataToSend.append("monthlySubscription", formData.monthlySubscription);
      formDataToSend.append("description", formData.description || "");

      if (formData.ingredients) {
        const ingredientsArray = formData.ingredients.split(",").map((i) => i.trim());
        formDataToSend.append("ingredients", JSON.stringify(ingredientsArray));
      }

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (editingProduct) {
        // Update product
        await productsAPI.update(editingProduct.id, formDataToSend);
        Swal.fire({
          title: "Updated!",
          text: "Product has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#6dce00",
        });
      } else {
        // Create product
        await productsAPI.create(formDataToSend);
        Swal.fire({
          title: "Added!",
          text: "Product has been added successfully.",
          icon: "success",
          confirmButtonColor: "#6dce00",
        });
      }

      resetForm();
      setFormVisible(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to save product. Please try again.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    }
  };

  // Handle edit
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
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.join(", ")
        : product.ingredients || "",
      description: product.description || "",
    });
    setPreviewImage(null);
    setImageFile(null);
    setFormVisible(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6dce00",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await productsAPI.delete(id);
        Swal.fire({
          title: "Deleted!",
          text: "Product has been deleted.",
          icon: "success",
          confirmButtonColor: "#6dce00",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete product. Please try again.",
          icon: "error",
          confirmButtonColor: "#6dce00",
        });
      }
    }
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/assets/21.png";
    if (imagePath.startsWith("http")) return imagePath;
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return imagePath.startsWith("/") ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <p className="text-gray-500">
          Manage and add your healthy food products.
        </p>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : (
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
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-300 text-xs hover:bg-green-50 transition"
                  >
                    <td className="px-4 py-2 font-medium">{p.productName}</td>
                    <td className="px-4 py-2">{p.packName}</td>
                    <td className="px-4 py-2">
                      <img
                        src={getImageUrl(p.imagePath)}
                        alt={p.productName}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    </td>
                    <td className="px-4 py-2">{p.weight}</td>
                    <td className="px-4 py-2">{p.proteinIntake}</td>
                    <td className="px-4 py-2">₹{p.singleOrder}</td>
                    <td className="px-4 py-2">₹{p.weeklySubscription}</td>
                    <td className="px-4 py-2">₹{p.monthlySubscription}</td>
                    <td className="px-4 py-2">{p.availableDay}</td>
                    <td className="px-4 py-2">{p.availableTime}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Button */}
      <div className="flex justify-start">
        <button
          onClick={() => {
            resetForm();
            setFormVisible(!formVisible);
          }}
          className="flex items-center gap-2 bg-[#6dce00] hover:bg-[#5bb300] text-white px-5 py-2.5 rounded-lg shadow-md transition"
        >
          {formVisible ? <X size={20} /> : <Plus size={20} />}
          {formVisible ? "Close Form" : "Add Product"}
        </button>
      </div>

      {/* Slide-down Form */}
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Text Fields */}
              {[
                { name: "productName", placeholder: "Product Name" },
                { name: "packName", placeholder: "Pack Name" },
                { name: "weight", placeholder: "Weight (e.g., 250g)" },
                {
                  name: "proteinIntake",
                  placeholder: "Protein Intake (e.g., 20g)",
                },
                { name: "availableDay", placeholder: "Available Day" },
                { name: "availableTime", placeholder: "Available Time" },
                {
                  name: "singleOrder",
                  placeholder: "Single Order Price (₹)",
                  type: "number",
                },
                {
                  name: "weeklySubscription",
                  placeholder: "Weekly Subscription (₹)",
                  type: "number",
                },
                {
                  name: "monthlySubscription",
                  placeholder: "Monthly Subscription (₹)",
                  type: "number",
                },
                {
                  name: "ingredients",
                  placeholder: "Ingredients (comma separated)",
                },
              ].map((field) => (
                <input
                  key={field.name}
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="border p-2 border-gray-300 rounded w-full focus:ring-2 focus:ring-[#6dce00] outline-none transition"
                  required={["productName", "packName", "weight"].includes(field.name)}
                />
              ))}

              {/* Image Upload */}
              <div className="sm:col-span-2">
                <label className="block text-gray-700 mb-1 font-medium">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-[#6dce00] outline-none transition"
                  />
                  {previewImage || (editingProduct && editingProduct.imagePath) ? (
                    <img
                      src={previewImage || getImageUrl(editingProduct.imagePath)}
                      alt="Preview"
                      className="w-12 h-12 rounded object-cover border border-gray-300"
                    />
                  ) : (
                    <ImagePlus className="text-gray-400 w-6 h-6" />
                  )}
                </div>
              </div>

              {/* Description */}
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full h-24 sm:col-span-2 focus:ring-2 focus:ring-[#6dce00] outline-none transition"
              ></textarea>

              {/* Buttons */}
              <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormVisible(false);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6dce00] hover:bg-[#5bb300] text-white rounded"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
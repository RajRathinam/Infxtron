import React, { useEffect, useState } from "react";
import { Plus, X, ImagePlus, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const [products, setProducts] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const loadProducts = async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    setProducts(data || []);
    console.log(data);
    
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const [formVisible, setFormVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const [imageFile, setImageFile] = useState(null);

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

  // Open form for editing
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

    // Convert comma-separated strings to JSON arrays
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

    if (editingProduct) {
      // Update product
      await fetch(`${BASE_URL}/api/products/${editingProduct.id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
    } else {
      // Add product
      await fetch(`${BASE_URL}/api/products`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
    }

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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await fetch(`${BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await loadProducts();
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
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-300 text-xs hover:bg-green-50 transition"
                >
                  <td className="px-4 py-2 font-medium">{p.productName}</td>
                  <td className="px-4 py-2">{p.packName}</td>
                  <td className="px-4 py-2">
                    <img
                      src={p.imagePath}
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
                        title="Edit"
                        onClick={() => handleEdit(p)}
                        className="p-1 rounded hover:bg-green-100"
                      >
                        <Pencil size={16} className="text-green-700" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(p.id)}
                        className="p-1 rounded hover:bg-red-100"
                      >
                        <Trash2 size={16} className="text-red-600" />
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
              ].map((field) => (
                <input
                  key={field.name}
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
                className="col-span-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;

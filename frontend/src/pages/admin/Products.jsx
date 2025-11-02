import React, { useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const [products, setProducts] = useState([
    {
      productName: "Protein Salad Bowl",
      packName: "Healthy Pack",
      weight: "250g",
      proteinIntake: "20g",
      availableDay: "Monday",
      availableTime: "9AM - 5PM",
      singleOrder: 150,
      weeklySubscription: 900,
      monthlySubscription: 3500,
      imagePath:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
    },    {
      productName: "Protein Salad Bowl",
      packName: "Healthy Pack",
      weight: "250g",
      proteinIntake: "20g",
      availableDay: "Monday",
      availableTime: "9AM - 5PM",
      singleOrder: 150,
      weeklySubscription: 900,
      monthlySubscription: 3500,
      imagePath:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
    },
  ]);

  const [formVisible, setFormVisible] = useState(false);
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
    imagePath: "",
    ingredients: "",
    description: "",
  });

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagePath: reader.result });
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add product (dummy)
  const handleSubmit = (e) => {
    e.preventDefault();
    setProducts([...products, formData]);
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
      description: "",
    });
    setPreviewImage(null);
    setFormVisible(false);
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
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p, index) => (
                <tr
                  key={index}
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Button (Below Table) */}
      <div className="flex justify-start">
        <button
          onClick={() => setFormVisible(!formVisible)}
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
              Add New Product
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
                {
                  name: "proteinIntake",
                  placeholder: "Protein Intake (e.g., 20g)",
                },
                { name: "availableDay", placeholder: "Available Day" },
                { name: "availableTime", placeholder: "Available Time" },
                {
                  name: "singleOrder",
                  placeholder: "Single Order Price (₹)",
                },
                {
                  name: "weeklySubscription",
                  placeholder: "Weekly Subscription (₹)",
                },
                {
                  name: "monthlySubscription",
                  placeholder: "Monthly Subscription (₹)",
                },
                {
                  name: "ingredients",
                  placeholder: "Ingredients (comma separated)",
                },
              ].map((field) => (
                <input
                  key={field.name}
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="border p-2 border-gray-300 rounded w-full focus:ring-2 focus:ring-[#6dce00] outline-none transition"
                  required={["productName", "packName", "weight"].includes(
                    field.name
                  )}
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
                  {previewImage ? (
                    <img
                      src={previewImage}
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
                  onClick={() => setFormVisible(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6dce00] hover:bg-[#5bb300] text-white rounded"
                >
                  Add Product
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

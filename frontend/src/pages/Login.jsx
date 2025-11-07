import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { login as setToken } from "../utils/auth";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Clear any stored credentials on mount to prevent auto-fill
  useEffect(() => {
    setEmail("");
    setPassword("");
    // Clear localStorage adminEmail if it exists
    localStorage.removeItem("adminEmail");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/api/admin/login", {
        email,
        password,
      }, {
        method: "POST",
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        // Session cookie is set by backend; store a lightweight token for client routing
        setToken("session");
        navigate("/admin");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid credentials. Please try again.";
      setErrorMsg(errorMessage);
      await Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Decorative Section */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-[#e6f8d9] to-[#f9fff2] relative overflow-hidden">
        <img
          src="/assets/organic-food-bg.png"
          alt="Healthy background"
          className="absolute opacity-20 w-[600px] -top-20 right-10 select-none pointer-events-none"
        />
        <div className="z-10 text-center px-10">
          <img
            src="/AGHealthyFood.png"
            alt="AG’s Healthy Food Logo"
            className="w-48 mx-auto mb-6 drop-shadow-md"
          />
          <h1 className="text-3xl font-semibold text-gray-700 leading-snug">
            Welcome Back, Admin 🌱
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Manage your products, track orders, and keep AG’s Healthy Food
            running smooth and fresh.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-green-50 to-white relative">
        {/* Decorative leaf images */}
        <img
          src="/assets/12.png"
          alt="Leaf decor"
          className="absolute top-0 right-10 w-[800px] rotate-12 pointer-events-none"
        />
        <img
          src="/assets/11.png"
          alt="Leaf decor"
          className="absolute bottom-10 left-15 w-[300px] opacity-60 rotate-12 pointer-events-none"
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg border border-gray-100 rounded-2xl px-8 py-10 w-[90%] max-w-sm z-10"
        >
          <h2 className="text-2xl font-semibold text-orange-600 dancing-script text-center mb-6">
            Admin Login
          </h2>

          {/* Email Input */}
          <div className="mb-4">
            <label className="text-gray-600 text-sm mb-1 block">Email</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-[#6dce00]/50 transition">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Password Input with Eye Toggle */}
          <div className="mb-4">
            <label className="text-gray-600 text-sm mb-1 block">Password</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-[#6dce00]/50 transition relative">
              <Lock size={18} className="text-gray-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 pr-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-red-500 text-sm text-center mb-3">{errorMsg}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#6dce00] text-white py-2 rounded-md transition font-medium ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-[#60b800]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Small Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            © {new Date().getFullYear()} AG’s Healthy Food | Admin Portal
          </p>
        </form>
      </div>
    </div>
  );
}

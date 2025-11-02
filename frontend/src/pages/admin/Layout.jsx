import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { adminAPI } from "../../utils/api";
import Swal from "sweetalert2";
import { Menu, X, LogOut, KeyRound, User, Eye, EyeOff } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      Swal.fire({
        title: "Missing Fields!",
        text: "Please fill in all password fields.",
        icon: "warning",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      Swal.fire({
        title: "Password Mismatch!",
        text: "New password and confirm password do not match.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
      return;
    }

    setLoading(true);

    try {
      await adminAPI.changePassword(
        form.oldPassword,
        form.newPassword,
        form.confirmPassword
      );
      
      Swal.fire({
        title: "Success!",
        text: "Password changed successfully!",
        icon: "success",
        confirmButtonColor: "#6dce00",
      });
      
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordModal(false);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to change password. Please try again.",
        icon: "error",
        confirmButtonColor: "#6dce00",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const activeClass =
    "text-[#6dce00] border-b-2 border-[#6dce00] font-medium transition";
  const inactiveClass =
    "text-gray-600 hover:text-[#6dce00] transition border-b-2 border-transparent";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex justify-between items-center px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img
            src="/Logo.png"
            alt="AG’s Healthy Food Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-semibold text-gray-700">Admin Panel</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 relative">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            Customers
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            Orders
          </NavLink>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition"
            >
              <User size={18} className="text-gray-600" />
              <span className="text-gray-700 font-medium">Admin</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  <KeyRound size={16} className="text-gray-500" />
                  Change Password
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogoutClick();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-[#6dce00] transition"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={26} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Sidebar for Mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50 transform transition-transform duration-300 flex flex-col ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-gray-600 hover:text-[#6dce00] transition"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 text-gray-700 flex-grow">
          <NavLink
            to="/admin"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 ${
                isActive
                  ? "bg-green-200/60 text-[#6dce00] font-medium"
                  : "hover:bg-green-100 hover:text-[#6dce00]"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 ${
                isActive
                  ? "bg-green-200/60 text-[#6dce00] font-medium"
                  : "hover:bg-green-100 hover:text-[#6dce00]"
              }`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/customers"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 ${
                isActive
                  ? "bg-green-200/60 text-[#6dce00] font-medium"
                  : "hover:bg-green-100 hover:text-[#6dce00]"
              }`
            }
          >
            Customers
          </NavLink>
          <NavLink
            to="/admin/orders"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 ${
                isActive
                  ? "bg-green-200/60 text-[#6dce00] font-medium"
                  : "hover:bg-green-100 hover:text-[#6dce00]"
              }`
            }
          >
            Orders
          </NavLink>
        </nav>

        {/* Change Password + Logout for Mobile */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-md font-medium transition flex items-center justify-center gap-2"
          >
            <KeyRound size={18} />
            Change Password
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogoutClick();
            }}
            className="w-full bg-[#6dce00] hover:bg-[#60b800] text-white py-2 rounded-md font-medium transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Old Password */}
              <div className="relative">
                <input
                  type={showPasswords.oldPassword ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Old Password"
                  value={form.oldPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-[#6dce00]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, oldPassword: !showPasswords.oldPassword })}
                  className="absolute right-3 top-[50%] transform -translate-y-[50%] text-gray-500 hover:text-gray-700 mt-1"
                >
                  {showPasswords.oldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="New Password"
                  value={form.newPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-[#6dce00]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })}
                  className="absolute right-3 top-[50%] transform -translate-y-[50%] text-gray-500 hover:text-gray-700 mt-1"
                >
                  {showPasswords.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-[#6dce00]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
                  className="absolute right-3 top-[50%] transform -translate-y-[50%] text-gray-500 hover:text-gray-700 mt-1"
                >
                  {showPasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6dce00] hover:bg-[#60b800] text-white py-2 rounded-md font-medium transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-6">
        <Outlet />
      </main>
    </div>
  );
}

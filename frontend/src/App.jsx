import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EcommerceLayout from "./pages/ecommerce/Layout";
import Home from "./pages/ecommerce/Home";
import About from "./pages/ecommerce/About";
import Contact from "./pages/ecommerce/Contact";
import Products from "./pages/ecommerce/Products";
import Cart from "./pages/ecommerce/Cart"; // ✅ import this
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Product from "./pages/admin/Products";
import Customers from "./pages/admin/Customers";
import Orders from "./pages/admin/Orders";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ecommerce */}
        <Route path="/" element={<EcommerceLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="cart" element={<Cart />} /> {/* ✅ new route */}
        </Route>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Product />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

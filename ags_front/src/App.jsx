// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EcommerceLayout from "./pages/ecommerce/Layout";
import Home from "./pages/ecommerce/Home";
import About from "./pages/ecommerce/About";
import Contact from "./pages/ecommerce/Contact";
import Products from "./pages/ecommerce/Products";
import Cart from "./pages/ecommerce/Cart";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Product from "./pages/admin/Products";
import Customers from "./pages/admin/Customers";
import Orders from "./pages/admin/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import PrivacyPolicy from "./pages/ecommerce/policies/PrivacyPolicy";
import TermsPolicy from "./pages/ecommerce/policies/TermsPolicy";
import ShippingPolicy from "./pages/ecommerce/policies/ShippingPolicy";
import RefundPolicy from "./pages/ecommerce/policies/RefundPolicy";
import ReturnPolicy from "./pages/ecommerce/policies/ReturnPolicy";
import PaymentResult from "./pages/ecommerce/PaymentResult";
import Transactions from "./pages/admin/Transactions";
import Offers from "./pages/admin/Offers";
import DietPlans from "./pages/admin/DietPlans";

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
          <Route path="cart" element={<Cart />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          {/* Policy Pages */}
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsPolicy />} />
          <Route path="shipping" element={<ShippingPolicy />} />
          <Route path="refunds" element={<RefundPolicy />} />
          <Route path="return" element={<ReturnPolicy />} />
        </Route>

        {/* Login - Protected with PublicRoute */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Admin - Protected with ProtectedRoute */}
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
          <Route path="transactions" element={<Transactions />} />
          <Route path="offers" element={<Offers />} />
          <Route path="diet-plans" element={<DietPlans />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
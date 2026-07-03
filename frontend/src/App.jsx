import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { LoadingBlock } from "./components/ui";
import { useBootstrapApp } from "./hooks/useBootstrapApp";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import BookingPage from "./pages/BookingPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminStaffPage from "./pages/admin/AdminStaffPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminDiscountsPage from "./pages/admin/AdminDiscountsPage";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="catalog" element={<AdminCatalogPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="discounts" element={<AdminDiscountsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

const App = () => {
  const ready = useBootstrapApp();

  if (!ready) {
    return <LoadingBlock label="Đang khởi tạo ứng dụng..." />;
  }

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;

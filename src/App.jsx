import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AudioController from './components/common/AudioController';

// Public Pages
import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import SignUpPage from './pages/public/SignUpPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

// Customer Pages & Layout
import CustomerRoute from './components/customer/CustomerRoute';
import CustomerDashboardLayout from './pages/customer/CustomerDashboardLayout';
import CustomerOverviewPage from './pages/customer/CustomerOverviewPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerOrderDetailPage from './pages/customer/CustomerOrderDetailPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import CustomerAddressesPage from './pages/customer/CustomerAddressesPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';

// Admin Pages & Layout
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function AppLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
      <AudioController />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout>
              <Routes>
                {/* Public Website Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:category" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<OrderSuccessPage />} />

                {/* Customer Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <CustomerRoute>
                      <CustomerDashboardLayout />
                    </CustomerRoute>
                  }
                >
                  <Route index element={<CustomerOverviewPage />} />
                  <Route path="orders" element={<CustomerOrdersPage />} />
                  <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="profile" element={<CustomerProfilePage />} />
                  <Route path="addresses" element={<CustomerAddressesPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/create" element={<AdminProductFormPage />} />
                  <Route path="products/:id" element={<AdminProductFormPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="delivery" element={<AdminDeliveryPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="content" element={<AdminContentPage />} />
                  <Route path="testimonials" element={<AdminTestimonialsPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Routes>
            </AppLayout>
          </CartProvider>
        </AuthProvider>
      </AudioProvider>
    </BrowserRouter>
  );
}

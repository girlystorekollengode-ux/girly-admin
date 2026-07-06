import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AdminLayout from './components/layout/AdminLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductList from './pages/products/ProductList.jsx';
import AddProduct from './pages/products/AddProduct.jsx';
import EditProduct from './pages/products/EditProduct.jsx';
import CategoryList from './pages/categories/CategoryList.jsx';
import OrderList from './pages/orders/OrderList.jsx';
import OrderDetail from './pages/orders/OrderDetail.jsx';
import CouponList from './pages/coupons/CouponList.jsx';
import UserList from './pages/users/UserList.jsx';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid #FFCCE5',
            background: '#FFFFFF',
            color: '#1A1A1A',
          },
        }}
      />
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Console Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id" element={<EditProduct />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="coupons" element={<CouponList />} />
          <Route path="users" element={<UserList />} />
        </Route>

        {/* Redirects */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

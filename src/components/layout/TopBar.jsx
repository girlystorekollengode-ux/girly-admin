import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Bell } from 'lucide-react';

const TopBar = () => {
  const location = useLocation();
  const { admin } = useAuthStore();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Dashboard';
    if (path.startsWith('/admin/products/add')) return 'Add New Product';
    if (path.startsWith('/admin/categories')) return 'Manage Categories';
    if (path.startsWith('/admin/orders/')) return 'Order Detailed Record';
    if (path.startsWith('/admin/orders')) return 'Customer Orders';
    if (path.startsWith('/admin/coupons')) return 'Discounts & Coupons';
    if (path.startsWith('/admin/users')) return 'Customer Accounts';
    if (path.includes('/products/')) return 'Edit Product Details';
    if (path.startsWith('/admin/products')) return 'Product Inventory';
    return 'Girly Admin';
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 right-0 z-30 flex items-center justify-between w-[calc(100%-260px)] h-16 bg-white border-b border-primary-200 px-8">
      {/* Left Title */}
      <h2 className="text-xl font-bold text-gray-800 font-poppins">{getTitle()}</h2>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-primary transition-colors cursor-pointer p-1.5 rounded-full hover:bg-primary-50">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Badge Profile */}
        {admin && (
          <div className="flex items-center gap-3 pl-4 border-l border-primary-100">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-pink-sm">
              {getInitials(admin.name)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-800 leading-none mb-0.5">
                {admin.name}
              </span>
              <span className="text-[10px] text-primary-dark font-medium leading-none">
                Administrator
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;

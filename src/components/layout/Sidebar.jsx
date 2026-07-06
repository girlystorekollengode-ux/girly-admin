import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import logo from '../../assets/logo.png';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Ticket,
  Users,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-[260px] h-screen bg-white border-r border-primary-200 flex flex-col justify-between">
      {/* Top Brand Logo */}
      <div>
        <div className="px-6 py-5 border-b border-[#FFCCE5] text-center flex flex-col items-center">
          <img src={logo} alt="Girly Logo" className="h-10 max-w-full object-contain" />
          <p className="text-[10px] uppercase tracking-widest font-sans text-primary-dark mt-2 font-bold opacity-80">
            Admin Panel
          </p>
        </div>

        {/* Navigation List */}
        <nav className="px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-poppins font-medium transition-all duration-150 ${isActive
                  ? 'bg-primary-50 text-primary border-l-[3px] border-primary rounded-l-none'
                  : 'text-gray-600 hover:bg-primary-50/50 hover:text-primary'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom User Account info */}
      <div className="p-4 border-t border-primary-100 bg-primary-50/40">
        {admin && (
          <div className="flex flex-col mb-3 px-2">
            <span className="text-xs font-bold text-gray-800 truncate">{admin.name}</span>
            <span className="text-[10px] text-gray-500 truncate">{admin.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-semibold rounded-full hover:brightness-105 transition-all shadow-pink-sm cursor-pointer"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, admin, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const checkSession = async () => {
      await checkAuth();
    };
    checkSession();
  }, [checkAuth]);

  useEffect(() => {
    if (admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back, Admin! 🌸');
      navigate('/admin');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-primary-50 to-primary-100 p-4">
      <Card
        className="w-full max-w-[420px] rounded-2xl shadow-pink-md border border-primary-200"
        padding="p-8"
      >
        <div className="text-center mb-8">
          {/* Logo */}
          <h1 className="text-4xl font-black text-primary font-playfair tracking-wide leading-none">
            Girly
          </h1>
          <p className="text-lg font-bold font-dancing text-primary-dark mt-1">
            Admin Panel
          </p>
          <h2 className="text-lg font-semibold text-gray-800 mt-4 font-poppins">
            Welcome back 💗
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@girly.com"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 ${errors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 pl-1">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/45 ${errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                  }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 pl-1">{errors.password.message}</span>
            )}
          </div>

          {/* Inline Error */}
          {errorMsg && (
            <div className="text-center text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 animate-pulse">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            size="lg"
            className="mt-2"
          >
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;

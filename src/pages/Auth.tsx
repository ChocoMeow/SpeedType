import { useState } from 'react';

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  // Register form
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!loginForm.email) {
      newErrors.loginEmail = 'Email is required';
    }
    
    if (!loginForm.password) {
      newErrors.loginPassword = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit login form
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Handle response here
      console.log('Login submitted', loginForm);
      setLoading(false);
      // Redirect to home page or show success message
    }, 1500);
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!registerForm.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!registerForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!registerForm.terms) {
      newErrors.terms = 'You must agree to terms and conditions';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit registration form
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Handle response here
      console.log('Registration submitted', registerForm);
      setLoading(false);
      // Redirect to home page or show success message
    }, 1500);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-gray-400">
          {activeTab === 'login' 
            ? 'Sign in to track your progress and compete on the leaderboard' 
            : 'Join thousands of typists improving their skills'}
        </p>
      </div>
      
      <div className="bg-[#111111] rounded-lg shadow-lg overflow-hidden border border-[#1A1A1A]">
        {/* Tabs */}
        <div className="flex">
          <button 
            className={`flex-1 py-4 text-center font-semibold ${
              activeTab === 'login' 
                ? 'bg-primary text-white' 
                : 'bg-[#0A0A0A] text-gray-400 hover:bg-[#181818] hover:text-gray-300'
            } transition-colors`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-4 text-center font-semibold ${
              activeTab === 'register' 
                ? 'bg-primary text-white' 
                : 'bg-[#0A0A0A] text-gray-400 hover:bg-[#181818] hover:text-gray-300'
            } transition-colors`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        
        <div className="p-6">
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className={`w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.loginEmail ? 'border-red-500' : 'border-[#1A1A1A]'
                  } text-gray-200`}
                  placeholder="your@email.com"
                />
                {errors.loginEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.loginEmail}</p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <a href="#" className="text-sm text-primary hover:text-primary-dark">Forgot password?</a>
                </div>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className={`w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.loginPassword ? 'border-red-500' : 'border-[#1A1A1A]'
                  } text-gray-200`}
                  placeholder="••••••••"
                />
                {errors.loginPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.loginPassword}</p>
                )}
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={loginForm.remember}
                  onChange={handleLoginChange}
                  className="h-4 w-4 text-primary focus:ring-primary bg-[#0A0A0A] border-[#1A1A1A]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Register now
                  </button>
                </p>
              </div>
            </form>
          )}
          
          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.username ? 'border-red-500' : 'border-[#1A1A1A]'
                  } text-gray-200`}
                  placeholder="speedtyper123"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.email ? 'border-red-500' : 'border-[#1A1A1A]'
                  } text-gray-200`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.password ? 'border-red-500' : 'border-[#1A1A1A]'
                  } text-gray-200`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#1A1A1A]'
                  } text-gray-200`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={registerForm.terms}
                  onChange={handleRegisterChange}
                  className={`h-4 w-4 text-primary focus:ring-primary bg-[#0A0A0A] border-[#1A1A1A] ${
                    errors.terms ? 'border-red-500' : ''
                  }`}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the <a href="#" className="text-primary hover:text-primary-dark">Terms and Conditions</a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-xs mb-4">{errors.terms}</p>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          By signing up, you agree to our <a href="#" className="text-primary hover:text-primary-dark">Privacy Policy</a> and <a href="#" className="text-primary hover:text-primary-dark">Terms of Service</a>
        </p>
      </div>
    </div>
  );
};

export default Auth; 
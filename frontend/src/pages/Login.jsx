import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('0f76079a0a');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Authenticating...');
    try {
      await login(email, password);
      toast.success('Welcome to Ivy Homes!', { id: loadingToast });
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ivy Homes</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">Log in with your demo credentials to access the assignment portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-70 disabled:hover:bg-blue-600 transition-all shadow-md mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
            Demo credentials are provided in your assignment email.
          </p>
        </div>
      </div>
    </div>
  );
}

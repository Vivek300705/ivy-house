import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavProvider } from './contexts/FavContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Rentals from './pages/Rentals';
import Projects from './pages/Projects';
import Favourites from './pages/Favourites';
import { Home, Building2, Key, Heart, LayoutDashboard, LogOut } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-orange-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-300 flex flex-col shadow-sm z-10 relative">
        <div className="p-6">
          <div className="flex items-center gap-2 text-emerald-900 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold text-xl">I</div>
            <h1 className="text-2xl font-bold tracking-tight">Ivy Homes</h1>
          </div>
          <p className="text-sm text-stone-500 truncate px-1">{user?.email}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          <NavLink to="/" end className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${isActive ? 'bg-emerald-50 text-emerald-950 shadow-sm' : 'text-stone-600 hover:bg-gray-100 hover:text-stone-900'}`}>
            <LayoutDashboard size={20} /> Insights
          </NavLink>
          <NavLink to="/listings" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${isActive ? 'bg-emerald-50 text-emerald-950 shadow-sm' : 'text-stone-600 hover:bg-gray-100 hover:text-stone-900'}`}>
            <Home size={20} /> Buy
          </NavLink>
          <NavLink to="/rentals" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${isActive ? 'bg-emerald-50 text-emerald-950 shadow-sm' : 'text-stone-600 hover:bg-gray-100 hover:text-stone-900'}`}>
            <Key size={20} /> Rent
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${isActive ? 'bg-emerald-50 text-emerald-950 shadow-sm' : 'text-stone-600 hover:bg-gray-100 hover:text-stone-900'}`}>
            <Building2 size={20} /> Projects
          </NavLink>
          <NavLink to="/favourites" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${isActive ? 'bg-emerald-50 text-emerald-950 shadow-sm' : 'text-stone-600 hover:bg-gray-100 hover:text-stone-900'}`}>
            <Heart size={20} /> Saved
          </NavLink>
        </nav>

        <div className="p-4 border-t border-stone-200 bg-orange-50/50">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-stone-600 w-full rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-orange-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FavProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/listings" element={<ProtectedRoute><Layout><Listings /></Layout></ProtectedRoute>} />
            <Route path="/listings/:id" element={<ProtectedRoute><Layout><ListingDetail /></Layout></ProtectedRoute>} />
            <Route path="/rentals" element={<ProtectedRoute><Layout><Rentals /></Layout></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
            <Route path="/favourites" element={<ProtectedRoute><Layout><Favourites /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" toastOptions={{
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        }} />
      </FavProvider>
    </AuthProvider>
  );
}

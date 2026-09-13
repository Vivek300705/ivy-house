import React, { useEffect, useState } from 'react';
import { fetchListing } from '../api';
import { useFav } from '../contexts/FavContext';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Favourites() {
  const { favourites, removeFav } = useFav();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (favourites.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const promises = favourites.map((id) => fetchListing(id).catch(() => null));
        const results = await Promise.all(promises);
        setListings(results.filter(Boolean));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load saved properties');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [favourites]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Heart className="text-red-500" fill="currentColor" size={32} /> Saved Properties
        </h1>
        <p className="text-gray-500 mt-2">Your shortlisted homes in Bangalore.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2].map(i => (
             <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse"></div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white py-24 rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-6">
            <Heart size={48} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved properties yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">Browse the listings and click the heart icon to save properties you love.</p>
          <Link to="/listings" className="bg-rose-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
            <Home size={20} /> Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => (
            <Link to={`/listings/${l.listing_id}`} key={l.listing_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                <img src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80&sig=${l.listing_id}`} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      removeFav(l.listing_id);
                      toast('Removed from saved', { icon: '💔' });
                    }}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg line-clamp-1 text-gray-900 mb-2">{l.apartment_name || `${l.bedroom} BHK ${l.property_type}`}</h3>
                <p className="text-gray-500 text-sm capitalize mb-4 line-clamp-1">{l.locality} • {l.property_type}</p>
                
                <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-2xl font-extrabold text-rose-600">₹{(l.price / 100000).toFixed(2)} <span className="text-base font-semibold">L</span></p>
                    <p className="text-sm text-gray-500 font-medium">{l.carpet_area_sqft} sq.ft</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

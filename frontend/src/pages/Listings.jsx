import React, { useEffect, useState, useCallback } from 'react';
import { fetchListings } from '../api';
import { useFav } from '../contexts/FavContext';
import { Link } from 'react-router-dom';
import { Heart, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    locality: '',
    bhk: '',
    min_price: '',
    max_price: '',
    furnishing: ''
  });

  const { favourites, addFav, removeFav } = useFav();

  const loadData = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const activeOffset = reset ? 0 : offset;
      const appliedFilters = {};
      if (filters.locality) appliedFilters.locality = filters.locality;
      if (filters.bhk) appliedFilters.bhk = parseInt(filters.bhk);
      if (filters.min_price) appliedFilters.min_price = parseInt(filters.min_price);
      if (filters.max_price) appliedFilters.max_price = parseInt(filters.max_price);
      if (filters.furnishing) appliedFilters.furnishing = filters.furnishing;

      const data = await fetchListings(activeOffset, 50, appliedFilters);
      
      if (reset) {
        setListings(data.results);
      } else {
        setListings(prev => [...prev, ...data.results]);
      }
      setHasMore(data.has_more);
      setOffset(activeOffset + 50);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [offset, filters]);

  useEffect(() => {
    loadData(true);
  }, [filters]);

  const toggleFav = (e, id) => {
    e.preventDefault();
    if (favourites.includes(id)) {
      removeFav(id);
      toast('Removed from saved', { icon: '💔' });
    } else {
      addFav(id);
      toast.success('Saved to favourites!');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Properties for Sale</h1>
          <p className="text-gray-500 mt-1">Discover your perfect home in Bangalore.</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center relative z-20">
        <div className="flex items-center gap-2 text-gray-400 pl-2">
          <Filter size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Locality (e.g. Whitefield)" 
          className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 flex-1 min-w-[150px]"
          value={filters.locality}
          onChange={e => setFilters({...filters, locality: e.target.value})}
        />
        <select 
          className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-w-[120px]"
          value={filters.bhk}
          onChange={e => setFilters({...filters, bhk: e.target.value})}
        >
          <option value="">Any BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>
        <input 
          type="number" 
          placeholder="Min Price (₹)" 
          className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-[140px]"
          value={filters.min_price}
          onChange={e => setFilters({...filters, min_price: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Max Price (₹)" 
          className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-[140px]"
          value={filters.max_price}
          onChange={e => setFilters({...filters, max_price: e.target.value})}
        />
        <select 
          className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-w-[150px]"
          value={filters.furnishing}
          onChange={e => setFilters({...filters, furnishing: e.target.value})}
        >
          <option value="">Any Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(l => (
          <Link to={`/listings/${l.listing_id}`} key={l.listing_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
              {/* Fake image placeholder to make it look premium */}
              <img src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80&sig=${l.listing_id}`} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-white/90 backdrop-blur text-gray-900 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                  {l.property_type}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-1 text-gray-900">{l.apartment_name || `${l.bedroom} BHK ${l.property_type}`}</h3>
                <button 
                  onClick={(e) => toggleFav(e, l.listing_id)}
                  className={`p-2 rounded-full -mt-1 -mr-1 transition-colors ${favourites.includes(l.listing_id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-red-400'}`}
                >
                  <Heart size={20} fill={favourites.includes(l.listing_id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="text-gray-500 text-sm capitalize mb-4 line-clamp-1">{l.locality} • Bangalore</p>
              
              <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-50">
                <div>
                  <p className="text-2xl font-extrabold text-rose-600">₹{(l.price / 100000).toFixed(2)} <span className="text-base font-semibold">L</span></p>
                  <p className="text-sm text-gray-500 font-medium">{l.carpet_area_sqft} sq.ft</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium capitalize">
                    {l.furnishing.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {listings.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Search className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No properties found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-10 text-center">
          <button 
            onClick={() => loadData(false)}
            className="bg-white border border-gray-200 px-8 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-stone-50 hover:shadow-sm transition-all focus:ring-2 focus:ring-rose-100"
          >
            Load More Properties
          </button>
        </div>
      )}
    </div>
  );
}

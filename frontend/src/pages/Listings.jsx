import React, { useEffect, useState, useCallback } from 'react';
import { fetchListings } from '../api';
import { useFav } from '../contexts/FavContext';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
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
    } finally {
      setLoading(false);
    }
  }, [offset, filters]);

  useEffect(() => {
    loadData(true);
  }, [filters]); // When filters change, reset and reload

  const toggleFav = (e, id) => {
    e.preventDefault();
    if (favourites.includes(id)) {
      removeFav(id);
    } else {
      addFav(id);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Properties for Sale</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input 
          type="text" 
          placeholder="Locality" 
          className="border px-3 py-2 rounded"
          value={filters.locality}
          onChange={e => setFilters({...filters, locality: e.target.value})}
        />
        <select 
          className="border px-3 py-2 rounded"
          value={filters.bhk}
          onChange={e => setFilters({...filters, bhk: e.target.value})}
        >
          <option value="">Any BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
        </select>
        <input 
          type="number" 
          placeholder="Min Price" 
          className="border px-3 py-2 rounded"
          value={filters.min_price}
          onChange={e => setFilters({...filters, min_price: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Max Price" 
          className="border px-3 py-2 rounded"
          value={filters.max_price}
          onChange={e => setFilters({...filters, max_price: e.target.value})}
        />
        <select 
          className="border px-3 py-2 rounded"
          value={filters.furnishing}
          onChange={e => setFilters({...filters, furnishing: e.target.value})}
        >
          <option value="">Any Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully-furnished</option>
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map(l => (
          <Link to={`/listings/${l.listing_id}`} key={l.listing_id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition group">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{l.apartment_name || `${l.bedroom} BHK ${l.property_type}`}</h3>
                <button 
                  onClick={(e) => toggleFav(e, l.listing_id)}
                  className={`p-2 rounded-full ${favourites.includes(l.listing_id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Heart size={20} fill={favourites.includes(l.listing_id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="text-gray-500 text-sm capitalize mb-4">{l.locality} • {l.property_type}</p>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{(l.price / 100000).toFixed(2)} L</p>
                  <p className="text-sm text-gray-500">{l.carpet_area_sqft} sq.ft</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm capitalize">
                    {l.furnishing}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {listings.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">No properties found.</div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button 
            onClick={() => loadData(false)}
            disabled={loading}
            className="bg-white border px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

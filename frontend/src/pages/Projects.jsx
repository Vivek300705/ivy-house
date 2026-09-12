import React, { useEffect, useState, useCallback } from 'react';
import { fetchProjects } from '../api';
import { Building2, MapPin } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadData = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const activeOffset = reset ? 0 : offset;
      const data = await fetchProjects(activeOffset, 50);
      
      if (reset) {
        setProjects(data.results);
      } else {
        setProjects(prev => [...prev, ...data.results]);
      }
      setHasMore(data.has_more);
      setOffset(activeOffset + 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    loadData(true);
  }, []);

  const formatPrice = (inr) => {
    if (inr >= 10000000) return `₹${(inr / 10000000).toFixed(2)} Cr`;
    return `₹${(inr / 100000).toFixed(2)} L`;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Builder Projects</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.project_id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl mb-1">{p.apartment_name}</h3>
                <p className="text-blue-600 font-medium text-sm">by {p.developer_name}</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold capitalize">
                {p.project_status}
              </span>
            </div>
            
            <p className="text-gray-500 text-sm capitalize flex items-center gap-1 mb-6">
              <MapPin size={14} /> {p.locality}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Price Range</p>
                <p className="font-medium text-gray-900">{formatPrice(p.price_min_inr)} - {formatPrice(p.price_max_inr)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Area Sq.ft</p>
                <p className="font-medium text-gray-900">{p.min_area_sqft} - {p.max_area_sqft}</p>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 size={16} /> {p.total_units} Units
              </div>
              <div className="font-medium">
                {p.total_listings} Listings
              </div>
            </div>
          </div>
        ))}
      </div>

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

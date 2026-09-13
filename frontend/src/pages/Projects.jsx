import React, { useEffect, useState, useCallback } from 'react';
import { fetchProjects } from '../api';
import { Building2, MapPin, Grid } from 'lucide-react';

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Builder Projects</h1>
        <p className="text-stone-500 mt-1">Explore new developments across Bangalore.</p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.project_id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="font-bold text-xl mb-1 text-stone-900">{p.apartment_name}</h3>
                <p className="text-emerald-900 font-semibold text-sm">by {p.developer_name}</p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                {p.project_status}
              </span>
            </div>
            
            <p className="text-stone-500 text-sm capitalize flex items-center gap-1.5 mb-6 relative z-10">
              <MapPin size={16} className="text-stone-400" /> {p.locality}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-orange-50 p-4 rounded-xl relative z-10">
              <div>
                <p className="text-[11px] text-stone-500 uppercase font-bold tracking-wider mb-1">Price Range</p>
                <p className="font-bold text-stone-900">{formatPrice(p.price_min_inr)} - {formatPrice(p.price_max_inr)}</p>
              </div>
              <div>
                <p className="text-[11px] text-stone-500 uppercase font-bold tracking-wider mb-1">Area Range</p>
                <p className="font-bold text-stone-900">{p.min_area_sqft} - {p.max_area_sqft} <span className="font-medium text-xs text-stone-500">sq.ft</span></p>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4 flex justify-between items-center text-sm text-stone-600 relative z-10">
              <div className="flex items-center gap-2 font-medium bg-emerald-50 text-emerald-950 px-2 py-1 rounded">
                <Grid size={16} /> {p.total_units} Units
              </div>
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Building2 size={16} className="text-stone-400" />
                {p.total_listings} Listings
              </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500 z-0">
              <Building2 size={150} />
            </div>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 h-64 animate-pulse p-6"></div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-10 text-center">
          <button 
            onClick={() => loadData(false)}
            className="bg-white border border-stone-300 px-8 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:shadow-sm transition-all focus:ring-2 focus:ring-emerald-100"
          >
            Load More Projects
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { fetchRentals } from '../api';
import { MapPin, Key } from 'lucide-react';

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadData = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const activeOffset = reset ? 0 : offset;
      const data = await fetchRentals(activeOffset, 50);
      
      if (reset) {
        setRentals(data.results);
      } else {
        setRentals(prev => [...prev, ...data.results]);
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Properties for Rent</h1>
        <p className="text-stone-500 mt-1">Find your next rental home in Bangalore.</p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map(r => (
          <div key={r.listing_id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg line-clamp-1 mb-2 text-stone-900">{r.title}</h3>
              <p className="text-stone-500 text-sm capitalize flex items-center gap-1.5 mb-5">
                <MapPin size={16} className="text-stone-400" /> {r.locality}
              </p>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 p-4 rounded-xl mb-5 flex justify-between items-center border border-emerald-100/50 mt-auto">
                <div>
                  <p className="text-[10px] text-emerald-900 uppercase font-bold tracking-wider mb-0.5">Monthly Rent</p>
                  <p className="text-2xl font-extrabold text-stone-900">₹{r.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-emerald-900 uppercase font-bold tracking-wider mb-0.5">Deposit</p>
                  <p className="text-sm font-bold text-gray-700">₹{r.deposit_inr.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-medium pt-1 border-t border-gray-50">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Key size={16} className="text-stone-400" /> {r.bedroom} BHK {r.property_type}
                </span>
                <span className="capitalize bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs">
                  {r.furnishing.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 h-56 animate-pulse"></div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="mt-10 text-center">
          <button 
            onClick={() => loadData(false)}
            className="bg-white border border-stone-300 px-8 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-orange-50 hover:shadow-sm transition-all focus:ring-2 focus:ring-emerald-100"
          >
            Load More Rentals
          </button>
        </div>
      )}
    </div>
  );
}

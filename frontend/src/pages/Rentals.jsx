import React, { useEffect, useState, useCallback } from 'react';
import { fetchRentals } from '../api';
import { MapPin } from 'lucide-react';

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
      <h1 className="text-2xl font-bold mb-6">Properties for Rent</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map(r => (
          <div key={r.listing_id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div className="p-5">
              <h3 className="font-semibold text-lg line-clamp-1 mb-2">{r.title}</h3>
              <p className="text-gray-500 text-sm capitalize flex items-center gap-1 mb-4">
                <MapPin size={14} /> {r.locality}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Monthly Rent</p>
                  <p className="text-xl font-bold text-gray-900">₹{r.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Deposit</p>
                  <p className="text-sm font-medium">₹{r.deposit_inr.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{r.bedroom} BHK {r.property_type}</span>
                <span className="capitalize bg-blue-50 text-blue-700 px-2 py-1 rounded">{r.furnishing}</span>
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

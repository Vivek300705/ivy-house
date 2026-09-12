import React, { useEffect, useState } from 'react';
import { fetchListing } from '../api';
import { useFav } from '../contexts/FavContext';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';

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
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [favourites]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="text-red-500" fill="currentColor" /> Saved Properties
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading saved properties...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center text-gray-500">
          No saved properties found. Browse listings and click the heart icon to save them.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => (
            <Link to={`/listings/${l.listing_id}`} key={l.listing_id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition group block">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{l.apartment_name || `${l.bedroom} BHK ${l.property_type}`}</h3>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      removeFav(l.listing_id);
                    }}
                    className="p-2 rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm capitalize mb-4">{l.locality} • {l.property_type}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{(l.price / 100000).toFixed(2)} L</p>
                    <p className="text-sm text-gray-500">{l.carpet_area_sqft} sq.ft</p>
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

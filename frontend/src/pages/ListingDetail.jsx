import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListing } from '../api';
import { useFav } from '../contexts/FavContext';
import { ArrowLeft, Heart, MapPin, Building2, User, Phone, CheckCircle } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { favourites, addFav, removeFav } = useFav();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchListing(id);
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading property...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!listing) return <div className="p-8 text-center">Property not found.</div>;

  const isFav = favourites.includes(listing.listing_id);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {listing.apartment_name || `${listing.bedroom} BHK ${listing.property_type}`}
            </h1>
            <p className="text-gray-500 flex items-center gap-2 text-lg capitalize">
              <MapPin size={18} /> {listing.locality}, Bangalore
            </p>
          </div>
          <button 
            onClick={() => isFav ? removeFav(listing.listing_id) : addFav(listing.listing_id)}
            className={`p-3 rounded-full border ${isFav ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Heart size={24} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50 p-6 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Asking Price</p>
            <p className="text-2xl font-bold text-blue-600">₹{(listing.price / 100000).toFixed(2)} L</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Area</p>
            <p className="text-2xl font-bold">{listing.carpet_area_sqft} <span className="text-sm font-normal text-gray-500">sq.ft</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-2xl font-bold capitalize">{listing.property_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bedrooms</p>
            <p className="text-2xl font-bold">{listing.bedroom} BHK</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Property Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3"><Building2 className="text-gray-400" /> Floor: {listing.floor} / {listing.total_floors}</div>
          <div className="flex items-center gap-3"><CheckCircle className="text-gray-400" /> Furnishing: <span className="capitalize">{listing.furnishing}</span></div>
          <div className="flex items-center gap-3"><CheckCircle className="text-gray-400" /> Bathrooms: {listing.bathroom}</div>
          <div className="flex items-center gap-3"><CheckCircle className="text-gray-400" /> Balconies: {listing.balcony}</div>
          <div className="flex items-center gap-3"><CheckCircle className="text-gray-400" /> Facing: <span className="capitalize">{listing.facing_direction}</span></div>
          <div className="flex items-center gap-3"><CheckCircle className="text-gray-400" /> Parking: {listing.covered_parking}</div>
        </div>

        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap mb-8 leading-relaxed">
          {listing.description}
        </p>

        <div className="border-t pt-6 mt-6 flex justify-between items-center bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <User size={24} />
            </div>
            <div>
              <p className="font-bold text-lg">{listing.posted_by_name}</p>
              <p className="text-gray-500 capitalize">{listing.posted_by}</p>
            </div>
          </div>
          <a href={`tel:${listing.posted_by_contact}`} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700">
            <Phone size={20} /> Contact Seller
          </a>
        </div>
      </div>
    </div>
  );
}

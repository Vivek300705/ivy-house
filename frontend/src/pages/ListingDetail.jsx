import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListing } from '../api';
import { useFav } from '../contexts/FavContext';
import { ArrowLeft, Heart, MapPin, Building2, User, Phone, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

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
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse">
        <div className="w-24 h-6 bg-gray-200 rounded mb-8"></div>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-96"></div>
      </div>
    );
  }
  if (error) return <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-xl m-8">{error}</div>;
  if (!listing) return <div className="p-8 text-center bg-gray-50 rounded-xl m-8">Property not found.</div>;

  const isFav = favourites.includes(listing.listing_id);

  const toggleFav = () => {
    if (isFav) {
      removeFav(listing.listing_id);
      toast('Removed from saved', { icon: '💔' });
    } else {
      addFav(listing.listing_id);
      toast.success('Saved to favourites!');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors">
        <ArrowLeft size={20} /> Back to Search
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Fake Banner */}
        <div className="h-64 w-full bg-gray-200 relative">
           <img src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80&sig=${listing.listing_id}`} alt="Property Banner" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <div className="absolute bottom-6 left-8 text-white">
             <span className="bg-blue-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest mb-3 inline-block">
               {listing.property_type}
             </span>
             <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
                {listing.apartment_name || `${listing.bedroom} BHK ${listing.property_type}`}
             </h1>
             <p className="flex items-center gap-2 text-lg capitalize text-gray-200">
               <MapPin size={20} /> {listing.locality}, Bangalore
             </p>
           </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-10 -mt-14 relative z-10">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4">
               <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Asking Price</p>
                  <p className="text-3xl font-extrabold text-blue-600">₹{(listing.price / 100000).toFixed(2)} L</p>
               </div>
            </div>
            
            <button 
              onClick={toggleFav}
              className={`p-4 rounded-full shadow-lg transition-transform hover:scale-105 ${isFav ? 'text-red-500 bg-white border border-red-100' : 'text-gray-400 bg-white border border-gray-100'}`}
            >
              <Heart size={28} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Area</p>
              <p className="text-2xl font-bold text-gray-900">{listing.carpet_area_sqft} <span className="text-sm font-medium text-gray-500">sq.ft</span></p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Type</p>
              <p className="text-2xl font-bold capitalize text-gray-900">{listing.property_type}</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Bedrooms</p>
              <p className="text-2xl font-bold text-gray-900">{listing.bedroom} BHK</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Bathrooms</p>
              <p className="text-2xl font-bold text-gray-900">{listing.bathroom}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-10">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-4 text-gray-900">About this property</h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-lg">
                {listing.description || "No description provided by the seller."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Features</h2>
              <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-50">
                <div className="flex items-center gap-3 text-gray-700 font-medium"><Building2 className="text-blue-500" size={20}/> Floor {listing.floor} of {listing.total_floors}</div>
                <div className="flex items-center gap-3 text-gray-700 font-medium capitalize"><CheckCircle className="text-blue-500" size={20}/> {listing.furnishing.replace('-', ' ')}</div>
                <div className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="text-blue-500" size={20}/> {listing.balcony} Balconies</div>
                <div className="flex items-center gap-3 text-gray-700 font-medium capitalize"><CheckCircle className="text-blue-500" size={20}/> {listing.facing_direction} Facing</div>
                <div className="flex items-center gap-3 text-gray-700 font-medium"><CheckCircle className="text-blue-500" size={20}/> {listing.covered_parking} Covered Parking</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-4 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 p-8 rounded-3xl">
            <div className="flex items-center gap-5 mb-6 md:mb-0">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg">
                <User size={32} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Listed By</p>
                <p className="font-bold text-xl text-gray-900">{listing.posted_by_name}</p>
                <p className="text-gray-500 capitalize">{listing.posted_by}</p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              {listing.listing_url && (
                 <a href={listing.listing_url} target="_blank" rel="noreferrer" className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                   <ExternalLink size={20} /> View Source
                 </a>
              )}
              <a href={`tel:${listing.listing_url ? '' : listing.posted_by_contact}`} className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
                <Phone size={20} /> Contact Seller
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
